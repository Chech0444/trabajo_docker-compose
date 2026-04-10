import { useState, useEffect } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  
  // Form state
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    date: '',
    time: '',
    service_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_URL}/services`);
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/appointments`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      // Reset form on success
      setFormData({
        client_name: '',
        client_email: '',
        date: '',
        time: '',
        service_id: ''
      });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar cita por completo?')) return;
    try {
      const res = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete appointment');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppointments = filter === 'ALL' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  return (
    <div className="app-container">
      <header>
        <h1>BookIt</h1>
        <p>Sistema premium de reservas y gestión de citas</p>
      </header>

      <div className="main-content">
        <div className="sidebar">
          <div className="glass-panel">
            <h2>📅 Nueva Cita</h2>
            {error && <div style={{ color: 'var(--status-cancelled)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Cliente</label>
                <input 
                  type="text" 
                  name="client_name"
                  className="form-control" 
                  value={formData.client_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  name="client_email"
                  className="form-control" 
                  value={formData.client_email}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Servicio</label>
                <select 
                  name="service_id"
                  className="form-control"
                  value={formData.service_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    name="date"
                    className="form-control" 
                    value={formData.date}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input 
                    type="time" 
                    name="time"
                    className="form-control" 
                    value={formData.time}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Cita'}
              </button>
            </form>
          </div>
          
          <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <h2>✨ Servicios</h2>
            <div className="services-list">
              {services.map(s => (
                <div key={s.id} className="service-card">
                  <div className="service-name">{s.name}</div>
                  <div className="service-desc">{s.description}</div>
                  <div className="service-duration">{s.duration_minutes} MINUTOS</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content">
          <div className="glass-panel" style={{ height: '100%' }}>
            <h2>📋 Citas Registradas ({appointments.length})</h2>
            
            <div className="filters">
              {['ALL', 'PENDING', 'DONE', 'CANCELLED'].map(f => (
                <button 
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'ALL' ? 'Todas' : f}
                </button>
              ))}
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                No hay citas en esta categoría.
              </div>
            ) : (
              <div className="appointments-grid">
                {filteredAppointments.map(appt => (
                  <div key={appt.id} className={`appointment-card status-${appt.status}`}>
                    <div className="appt-header">
                      <div>
                        <div className="appt-title">{appt.client_name}</div>
                        <div className="appt-service">{appt.service_name} • {appt.duration_minutes}m</div>
                      </div>
                      <span className={`appt-badge ${appt.status}`}>{appt.status}</span>
                    </div>

                    <div className="appt-details">
                      <div className="detail-item">
                        <span className="detail-label">FECHA</span>
                        <span>{new Date(appt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">HORA</span>
                        <span>{appt.time.substring(0,5)}</span>
                      </div>
                      <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                        <span className="detail-label">CORREO</span>
                        <span>{appt.client_email}</span>
                      </div>
                    </div>

                    {appt.status === 'PENDING' && (
                      <div className="appt-actions">
                        <button className="btn-sm btn-done" onClick={() => handleUpdateStatus(appt.id, 'DONE')}>
                          ✔ Atender
                        </button>
                        <button className="btn-sm btn-cancel" onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}>
                          ✖ Cancelar
                        </button>
                      </div>
                    )}
                    
                    {appt.status !== 'PENDING' && (
                      <div className="appt-actions">
                        <button className="btn-sm btn-delete" onClick={() => handleDelete(appt.id)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
