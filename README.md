# 🚛 TruckSetu

**Smart Truck Logistics & Optimization System**

TruckSetu is a full-stack, multi-role logistics platform that connects **Warehouses**, **Truck Dealers**, and **Admins** to streamline freight shipment, truck booking, trip management, and route optimization — powered by an integrated ML microservice.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A — Run with Docker (Recommended)](#option-a--run-with-docker-recommended)
  - [Option B — Run Manually in Terminal](#option-b--run-manually-in-terminal)
- [Default Ports](#-default-ports)
- [Environment Variables](#-environment-variables)
- [User Roles](#-user-roles)
- [API Modules](#-api-modules)
- [License](#-license)

---

## ✨ Features

### Authentication & Security
- JWT access + refresh-token rotation with secure HTTP-only cookies
- Email verification & password reset flows
- Multi-session management (view / revoke active sessions)
- Role-based access control (Admin, Analyst, Warehouse, Dealer)
- Rate limiting & Helmet security headers

### Warehouse Module
- Create & manage shipments (origin → destination, weight, volume, deadlines)
- Run ML-powered truck optimization to rank best-fit trucks
- Send booking requests to truck dealers
- Track shipment lifecycle from Draft → Delivered
- View shipment history with filters & search
- Real-time shipment tracking on interactive maps
- Truck-fit estimation tool

### Dealer Module
- Manage truck fleet (add, edit, view trucks)
- Accept / reject / counter booking requests
- View & manage active trips
- Return-load matching — pick up nearby shipments on the way back
- Fleet analytics dashboard

### Admin Module
- Full user management (activate, suspend, disable accounts)
- Analyst management (add / remove analyst users)
- System-wide analytics dashboard

### ML & Intelligence (FastAPI Microservice)
- **Route Optimization** — scores & ranks trucks by utilization, cost, CO₂, and proximity
- **Demand Forecasting** — predicts future shipment volumes using Prophet
- **Dynamic Pricing** — ML-based shipment cost estimation
- **Return-Load Scoring** — finds matching return shipments to reduce empty runs
- **Distance Matrix** — calculates real distances via OSRM
- **CO₂ Emission Estimation** — per-trip carbon footprint reports
- **Model Retraining** — scheduled cron-triggered retraining pipeline

### Real-Time & Background
- Socket.IO real-time notifications & tracking updates
- Redis pub-sub for scalable WebSocket broadcasting
- Background jobs: booking expiry, GPS simulation, return-load triggering, ML retraining
- Email notifications for booking, trip, and return-load events

### Document Generation
- Invoice PDF generation for trips
- CO₂ report PDF generation
- MinIO-backed object storage for documents

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, React Query, React Hook Form, Recharts, Leaflet |
| **Backend** | Node.js, Express, Prisma ORM, Socket.IO, Zod validation |
| **ML Service** | Python, FastAPI, scikit-learn, Prophet, OR-Tools, Pandas, NumPy |
| **Database** | PostgreSQL 15 |
| **Cache / Pub-Sub** | Redis 7 |
| **Object Storage** | MinIO |
| **Routing Engine** | OSRM (OpenStreetMap) |
| **Maps** | Leaflet + OpenStreetMap tiles |
| **Containerization** | Docker & Docker Compose |

---

## 🏗 Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  Backend    │────▶│  PostgreSQL DB  │
│  (React+Vite)│     │ (Express)   │     └─────────────────┘
│  Port: 3000  │     │ Port: 4000  │────▶┌─────────────────┐
└─────────────┘     │             │     │     Redis        │
       │            │             │     └─────────────────┘
       │ WebSocket  │             │────▶┌─────────────────┐
       └───────────▶│  Socket.IO  │     │     MinIO        │
                    └──────┬──────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────┐     ┌─────────────────┐
                    │  ML Service │────▶│      OSRM       │
                    │  (FastAPI)  │     │  (Route Engine)  │
                    │  Port: 8000 │     └─────────────────┘
                    └─────────────┘
```

---

## 📂 Project Structure

```
TruckSetu/
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── pages/           # Role-based page components
│   │   │   ├── auth/        # Login, Register, Forgot/Reset Password, Email Verify
│   │   │   ├── warehouse/   # Shipments, Bookings, Tracking, Optimization
│   │   │   ├── dealer/      # Fleet, Booking Requests, Trips, Return Loads
│   │   │   ├── admin/       # User Management, Analytics
│   │   │   └── shared/      # Booking Detail (cross-role)
│   │   ├── components/      # Reusable UI components
│   │   ├── api/             # Axios API client & endpoint modules
│   │   ├── store/           # Zustand state management
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Helper functions
│   ├── Dockerfile
│   └── .env.example
│
├── backend/                 # Express REST API + WebSocket server
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Business logic controllers
│   │   ├── services/        # Data access & service layer
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── jobs/            # Cron-based background jobs
│   │   ├── sockets/         # Socket.IO event handlers
│   │   ├── validators/      # Zod request validation schemas
│   │   └── utils/           # Helpers (email, PDF, etc.)
│   ├── Dockerfile
│   └── .env.example
│
├── ml-service/              # FastAPI ML microservice
│   ├── app/
│   │   ├── routers/         # API endpoints (scoring, routing, forecast, etc.)
│   │   ├── services/        # ML model logic
│   │   ├── models/          # Pydantic schemas
│   │   └── utils/           # Helpers
│   ├── Dockerfile
│   └── .env.example
│
├── prisma/                  # Shared database schema
│   ├── schema.prisma        # Prisma schema (all models)
│   └── migrations/          # Migration history
│
├── .env.example             # Root environment template
├── docker-compose.example.yml  # Docker Compose template
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required For |
|---|---|---|
| **Node.js** | 18+ | Backend & Frontend |
| **Python** | 3.10+ | ML Service |
| **PostgreSQL** | 15+ | Database (or use Docker) |
| **Redis** | 7+ | Real-time & caching (or use Docker) |
| **Docker & Docker Compose** | Latest | Option A (containerized setup) |

---

### Option A — Run with Docker (Recommended)

The fastest way to get everything running. Docker Compose will spin up PostgreSQL, Redis, MinIO, Backend, Frontend, and ML Service for you.

**Step 1 — Clone the repository**

```bash
git clone https://github.com/keraliya07/TruckSetu.git
cd TruckSetu
```

**Step 2 — Create environment & compose files**

```bash
cp .env.example .env
cp docker-compose.example.yml docker-compose.yml
```

**Step 3 — (Optional) Update secrets**

Open `.env` and change these values for security:

```env
JWT_SECRET=your-long-random-secret-here
JWT_REFRESH_SECRET=a-different-long-random-secret
```

For email notifications, update SMTP credentials:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

> **Note:** All other defaults (database, Redis, MinIO) work out of the box with Docker.

**Step 4 — Start all services**

```bash
docker compose up -d
```

Wait for all containers to be healthy. The backend container will automatically:
1. Generate the Prisma client
2. Run database migrations
3. Start the dev server

**Step 5 — Open the app**

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:4000/api](http://localhost:4000/api) |
| ML Service | [http://localhost:8000/docs](http://localhost:8000/docs) |
| MinIO Console | [http://localhost:9001](http://localhost:9001) |

**Stop all services:**

```bash
docker compose down
```

**Reset everything (including database):**

```bash
docker compose down -v
```

---

### Option B — Run Manually in Terminal

Run each service separately on your machine. You'll need PostgreSQL and Redis installed locally (or running via Docker).

**Step 1 — Clone the repository**

```bash
git clone https://github.com//TruckSetu.git
cd TruckSetu
```

**Step 2 — Set up environment files**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml-service/.env.example ml-service/.env
```

Update `DATABASE_URL` in both `.env` and `backend/.env` to point to your PostgreSQL:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/stlos_db
DIRECT_URL=postgresql://your_user:your_password@localhost:5432/stlos_db
```

**Step 3 — Set up the database**

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE stlos_db;"
```

Generate Prisma client & run migrations:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

**Step 4 — Start the Backend** (Terminal 1)

```bash
cd backend
npm run dev
```

The API server will start on `http://localhost:4000`.

**Step 5 — Start the Frontend** (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:3000`.

**Step 6 — Start the ML Service** (Terminal 3)

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The ML API will start on `http://localhost:8000`. Interactive docs available at `http://localhost:8000/docs`.

> **Tip:** If you use a Python virtual environment (recommended):
> ```bash
> cd ml-service
> python -m venv .venv
> .venv\Scripts\activate       # Windows
> # source .venv/bin/activate  # macOS / Linux
> pip install -r requirements.txt
> uvicorn app.main:app --reload --port 8000
> ```

---

## 🔌 Default Ports

| Service | Port |
|---|---|
| Frontend (Vite) | `3000` |
| Backend (Express) | `4000` |
| ML Service (FastAPI) | `8000` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| MinIO API | `9000` |
| MinIO Console | `9001` |
| OSRM (optional) | `5000` |

---

## 🔐 Environment Variables

The `.env.example` file in the project root contains all configuration with sensible defaults. Key groups:

| Group | Variables | Notes |
|---|---|---|
| **Database** | `DATABASE_URL`, `DIRECT_URL` | Prisma connection strings |
| **Redis** | `REDIS_URL` | Optional for single-instance local dev |
| **JWT** | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN` | **Change secrets before any real usage** |
| **Cookies** | `COOKIE_SECURE`, `COOKIE_SAME_SITE` | Set `COOKIE_SECURE=true` for HTTPS |
| **API** | `PORT`, `CORS_ORIGIN`, `APP_BASE_URL` | Backend server config |
| **ML Service** | `PYTHON_ML_URL`, `ML_REQUEST_TIMEOUT_MS` | Backend → FastAPI connection |
| **OSRM** | `OSRM_URL` | Defaults to public OSRM server |
| **MinIO** | `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | Object storage for documents |
| **Email** | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Required for email notifications |
| **Jobs** | `JOBS_ENABLED`, `BOOKING_TIMEOUT_CRON`, `GPS_SIMULATOR_ENABLED` | Background job toggles |
| **Frontend** | `VITE_API_URL`, `VITE_SOCKET_URL` | Frontend → Backend connection |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Admin** | User management, analyst management, system analytics |
| **Analyst** | Platform analytics & reporting (managed by Admins) |
| **Warehouse** | Create shipments, run optimization, book trucks, track deliveries |
| **Dealer** | Manage truck fleet, handle booking requests, manage trips, return loads |

New users can register as **Warehouse** or **Dealer** and complete an onboarding profile before accessing the platform.

---

## 📡 API Modules

### Backend (Express — `/api`)

| Module | Description |
|---|---|
| `auth` | Register, login, logout, refresh token, verify email, reset password, sessions |
| `shipment` | CRUD shipments, status transitions, list & filter |
| `truck` | CRUD trucks, fleet status, truck-fit estimation |
| `booking` | Create, approve, reject, counter booking requests |
| `trip` | Create trips from bookings, update status, stop management |
| `optimization` | Run ML optimization, view cached results, rank trucks |
| `returnLoad` | Match & manage return-load opportunities |
| `tracking` | Real-time GPS location updates & history |
| `analytics` | Platform-wide & role-specific dashboards |
| `notification` | In-app notification CRUD & WebSocket push |
| `admin` | User & analyst management |

### ML Service (FastAPI — `http://localhost:8000`)

| Endpoint | Description |
|---|---|
| `/scoring` | Truck scoring & ranking for shipments |
| `/routing` | Route optimization via OSRM |
| `/forecast` | Demand volume forecasting |
| `/prediction` | Dynamic price prediction |
| `/distance` | Distance matrix computation |
| `/co2` | Carbon emission estimation |
| `/return-load` | Return-load opportunity scoring |
| `/retrain` | Trigger model retraining |

---

## 📄 License

This project is for educational and demonstration purposes.
