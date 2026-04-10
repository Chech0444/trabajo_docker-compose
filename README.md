# BookIt - Sistema de reservas de citas

BookIt es una aplicación web para la gestión de servicios y reservas de citas. Permite listar servicios, agendar, y administrar (finalizar/cancelar) las citas.

## Imágenes en Docker Hub
- Frontend: `chech0/bookit-frontend`
- Backend: `chech0/bookit-backend`

## Requerimientos
- Docker
- Docker Compose

## Cómo ejecutar

1. Clonar este proyecto.
2. Copiar el archivo `.env.example` y renombrarlo a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Iniciar todos los contenedores usando Docker Compose:
   ```bash
   docker compose up -d
   ```
4. Esperar unos segundos para que los servicios se inicialicen, la base de datos se cree y se inserten los datos por defecto.

## URLs de Acceso

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **Backend API Docs (Rutas):**
  - GET `http://localhost:3000/services`
  - GET `http://localhost:3000/appointments`
  - POST `http://localhost:3000/appointments`
  - PATCH `http://localhost:3000/appointments/:id/status`
  - DELETE `http://localhost:3000/appointments/:id`
