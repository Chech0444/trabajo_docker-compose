const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'bookit_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'bookit',
  password: process.env.POSTGRES_PASSWORD || 'bookit_password',
  port: process.env.POSTGRES_PORT || 5432,
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});

// GET /services
app.get('/services', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM services ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /appointments
app.get('/appointments', async (req, res) => {
  try {
    const query = `
      SELECT a.*, s.name as service_name, s.duration_minutes
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      ORDER BY a.date DESC, a.time DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /appointments
app.post('/appointments', async (req, res) => {
  const { client_name, client_email, date, time, service_id } = req.body;
  if (!client_name || !client_email || !date || !time || !service_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const serviceCheck = await pool.query('SELECT id FROM services WHERE id = $1', [service_id]);
    if (serviceCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Service not found' });
    }

    const { rows } = await pool.query(
      'INSERT INTO appointments (client_name, client_email, date, time, status, service_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [client_name, client_email, date, time, 'PENDING', service_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /appointments/:id/status
app.patch('/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['DONE', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const check = await pool.query('SELECT status FROM appointments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const currentStatus = check.rows[0].status;
    if (currentStatus === 'CANCELLED' && status === 'DONE') {
      return res.status(400).json({ error: 'Cannot mark cancelled appointment as done' });
    }
    if (currentStatus === 'DONE' && status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel an already done appointment' });
    }

    const { rows } = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /appointments/:id
app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
