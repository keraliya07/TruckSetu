# TruckSetu

TruckSetu is a multi-role logistics platform for warehouses, truck dealers, and admins. The current repo includes persistent auth, operational shipment and booking foundations, trip workflows, and the frontend surfaces needed to exercise those flows.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL / Supabase
- ML Service: FastAPI
- Realtime / Pub-Sub target: Socket.IO + Redis
- Mapping target: Leaflet + OpenStreetMap
- Routing target: OSRM
- Object storage target: MinIO

## Current Implementation

### Live now

- Persistent JWT auth with refresh-token rotation
- Prisma-backed session storage
- Password reset flow
- Email verification flow
- Account session management
- Shipment, truck, booking, and trip modules
- Live optimization scoring API with Prisma-backed cached runs
- Truck-fit estimation endpoint and warehouse UI
- ML-backed demand forecast, pricing, distance matrix, and CO2 contracts
- ML-backed return-load scoring with validated backend/FastAPI contracts
- Role-based dashboards and protected routes
- Full authenticated app shell with navbar, sidebar, notifications, toasts, and error boundary
- Tracking, optimization, return-load, and analytics UI foundations
- Admin user management views
- Invoice and CO2 report PDF generation for trips
- Notification email delivery hooks for booking, trip, and return-load events
- Local background jobs for booking expiry, GPS simulation, return-load triggering, and ML retrain pings
- Prisma migrations committed in `prisma/migrations`

### Still pending

- Full production infrastructure
- Richer reporting, exports, and audit trails
- CI/CD, observability, and deployment hardening

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase or PostgreSQL database

### Environment setup

Create these files and fill them in:

- `.env`
- `backend/.env`
- `frontend/.env`
- `ml-service/.env`

Important backend/root env keys:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `APP_BASE_URL`
- `CORS_ORIGIN`
- `PYTHON_ML_URL`
- `ML_REQUEST_TIMEOUT_MS`
- `JOBS_ENABLED`
- `BOOKING_TIMEOUT_CRON`
- `ML_RETRAIN_CRON`
- `GPS_SIMULATOR_ENABLED`

Notes:

- Prisma schema lives in `prisma/schema.prisma`.
- Prisma client is generated into `backend/generated/prisma`.
- For local password-reset and verification links, use `APP_BASE_URL=http://localhost:3000`.
- `ML_REQUEST_TIMEOUT_MS` controls backend-to-FastAPI call timeouts for optimization and return-load scoring.
- `REDIS_URL` is only used for Socket.IO pub-sub scaling and is optional for single-instance local development.
- For production, rotate `JWT_SECRET`, `JWT_REFRESH_SECRET`, and your database credentials before deploy.
- For production cookies behind HTTPS, set `COOKIE_SECURE=true`. If frontend and backend run on different origins, use `COOKIE_SAME_SITE=none` with HTTPS enabled.

### Start backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Start frontend

```bash
cd frontend
npm install
npm run dev
```

### Run local Phase 2 checks

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

These local checks cover:

- backend auth integration flow
- backend shipment, truck, booking, and trip lifecycle flow
- backend ML gateway contract validation for scoring, routing, forecasting, pricing, distance, and CO2
- frontend protected-route auth gating
- frontend session bootstrap and restore behavior
- frontend forgot-password, reset-password, verification, and session-management screens
- frontend shared shell, toast, and notification behavior through integrated page coverage

### Start ML service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```text
trucksetu/
|-- frontend/           React + Vite application
|-- backend/            Express API
|-- ml-service/         FastAPI ML microservice
|-- prisma/             Shared Prisma schema and migrations
|-- osrm-data/          OSRM map data (gitignored)
|-- TASKS.md            Project task board
`-- docker-compose.yml  Development environment definition
```

## Task Tracking

See [TASKS.md](./TASKS.md) for the current project board, the completed Phase 2 checklist, and the later-phase backlog.
