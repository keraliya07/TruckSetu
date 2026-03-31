# Smart Truck Loading Optimization System (STLOS)

<!-- TODO: Add project logo/banner image here -->

> A multi-city logistics web platform that optimizes truck loading, routing, and tracking for warehouses and truck dealers.

## 🏗️ Architecture

<!-- TODO: Add architecture diagram (Mermaid or image) showing:
  - React frontend → Node.js API → PostgreSQL
  - Node.js API → Python ML Service
  - Node.js API → Redis (cache + pub/sub)
  - Node.js API → OSRM (routing)
  - Socket.io for real-time tracking
  - MinIO for document storage
-->

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend API | Node.js + Express |
| ML/Optimization | Python FastAPI + OR-Tools + scikit-learn |
| Database | PostgreSQL + Prisma ORM |
| Cache/PubSub | Redis |
| Real-time | Socket.io |
| Maps | Leaflet.js + OpenStreetMap |
| Routing Engine | OSRM (self-hosted) |
| Containerization | Docker + Docker Compose |
| Object Storage | MinIO |

## 👥 User Roles

- **Warehouse User** — Creates shipments, runs optimization, books trucks, tracks deliveries
- **Truck Dealer** — Manages fleet, responds to booking requests, manages active trips
- **Admin** — Platform oversight, user management, analytics, dispute resolution

## 🚀 Key Features

1. JWT authentication with role-based access control
2. Shipment management with multi-parameter optimization
3. Truck fleet management with pickup/delivery zone mapping
4. 4-parameter scoring engine (utilization 35%, route 25%, cost 20%, CO2 20%)
5. Multi-warehouse trip loading
6. Dynamic VRP route optimization (OR-Tools PDPTW)
7. Real-time GPS tracking with simulated movement
8. 3-layer pricing model with counter-offer workflow
9. Return load matching after trip completion
10. Analytics dashboard with demand forecasting
11. CO2 savings calculator with PDF reports
12. Truck Fit Calculator

## 📦 Getting Started

### Prerequisites

- Docker & Docker Compose v2
- Node.js 18+ (for local dev without Docker)
- Python 3.10+ (for ML service local dev)

### Quick Start (Docker)

```bash
# 1. Clone the repo
git clone <repo-url> && cd stlos

# 2. Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ml-service/.env.example ml-service/.env

# 3. Prepare OSRM data (one-time setup)
mkdir -p osrm-data
# Download India map: https://download.geofabrik.de/asia/india-latest.osm.pbf
# Place in osrm-data/ and process with osrm-extract, osrm-partition, osrm-customize

# 4. Start all services
docker compose up -d

# 5. Run database migrations
docker compose exec node-api npx prisma migrate dev

# 6. Open the app
# Frontend: http://localhost:3000
# API: http://localhost:4000
# ML Service: http://localhost:8000/docs
# MinIO Console: http://localhost:9001
```

### Local Development (without Docker)

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npx prisma migrate dev && npm run dev

# ML Service
cd ml-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
```

## 📁 Project Structure

```
stlos/
├── frontend/          ← React + Vite + Tailwind CSS
├── backend/           ← Node.js + Express API
├── ml-service/        ← Python FastAPI ML microservice
├── prisma/            ← Shared database schema
├── osrm-data/         ← OSRM map data (gitignored)
└── docker-compose.yml ← Development environment
```

<!-- TODO: Add detailed API documentation link -->
<!-- TODO: Add contributing guidelines -->
<!-- TODO: Add license information -->
