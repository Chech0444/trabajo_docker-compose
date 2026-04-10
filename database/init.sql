CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    service_id INTEGER NOT NULL REFERENCES services(id)
);

-- Insertar servicios por defecto
INSERT INTO services (name, description, duration_minutes) VALUES
    ('Corte de cabello', 'Corte de estilo moderno y perfilado', 30),
    ('Asesoría académica', 'Tutoría en matemáticas y ciencias', 60),
    ('Consulta técnica', 'Revisión y diagnóstico de computadores', 45),
    ('Tutoría de programación', 'Clase de lenguajes de programación y bases de datos', 120);
