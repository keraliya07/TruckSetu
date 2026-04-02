# Smart Truck Loading Optimization System (STLOS)

STLOS is a multi-role logistics platform for warehouses, truck dealers, and admins. The current repo includes persistent auth, operational shipment and booking foundations, trip workflows, and the frontend surfaces needed to exercise those flows.

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
- Role-based dashboards and protected routes
- Tracking, optimization, and analytics UI foundations
- Prisma migrations committed in `prisma/migrations`

### Still pending

- Optimization execution and scoring engine integration
- Tracking sockets and Redis pub-sub
- Return-load workflow
- Analytics backend APIs
- Admin management APIs
- Background jobs
- Full production infrastructure

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

Notes:

- Prisma schema lives in `prisma/schema.prisma`.
- Prisma client is generated into `backend/generated/prisma`.
- For local password-reset and verification links, use `APP_BASE_URL=http://localhost:3000`.
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
- frontend protected-route auth gating
- frontend session bootstrap and restore behavior
- frontend forgot-password, reset-password, verification, and session-management screens

### Start ML service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```text
stlos/
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
