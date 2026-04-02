# STLOS Task Board

## Current Status

- Phase 1 is complete.
- Phase 2 foundation is complete.
- Phase 2 local checklist is complete.
- Phase 2 production guidance is documented, while later-phase feature work is still open.
- Core logistics flows exist for auth, shipments, trucks, bookings, trips, dashboards, details, tracking views, and analytics views.
- Many backend advanced services and realtime/ML modules are still pending.

## Done

### Phase 1 - Foundation

- [x] Frontend app bootstrapped with React + Vite
- [x] Backend app bootstrapped with Express
- [x] ML service bootstrapped with FastAPI
- [x] Health endpoints added
- [x] Role-aware frontend routing added
- [x] Demo auth flow implemented
- [x] Warehouse, dealer, and admin dashboard foundations added

### Phase 2 - Database And Persistent Auth Foundation

- [x] Supabase database connected
- [x] Prisma schema created
- [x] Baseline Prisma migration created and locked
- [x] Prisma migration history fixed and verified
- [x] Backend switched from in-memory auth to Prisma-backed auth
- [x] Refresh-token session model added
- [x] Access token + refresh token rotation implemented
- [x] Refresh token stored in secure HTTP-only cookie
- [x] Logout invalidates refresh session
- [x] Environment validation improved
- [x] Seed data expanded
- [x] Frontend auth refresh/restore flow implemented
- [x] Prisma client moved to backend-owned generated output

### Core Application Work Already Implemented

- [x] Shipment CRUD module
- [x] Truck CRUD module
- [x] Booking workflow module
- [x] Trip creation on booking approval
- [x] Shipment detail page
- [x] Truck detail page
- [x] Booking detail page
- [x] Optimization page shell
- [x] Tracking page shell
- [x] Dealer and admin analytics views
- [x] Route-based code splitting and bundle cleanup

## Phase 2 Checklist

### Auth Closeout

- [x] Password reset request endpoint
- [x] Password reset confirmation endpoint
- [x] Email verification token generation
- [x] Email verification endpoint
- [x] Session management endpoint: list active sessions
- [x] Session management endpoint: revoke one session
- [x] Session management endpoint: revoke all other sessions
- [x] Frontend page for account sessions
- [x] Frontend page for password reset
- [x] Frontend page for email verification status

### Documentation And Cleanup

- [x] Update stale phase labels in backend API metadata
- [x] Update README to reflect current implementation status
- [x] Document new auth/session env keys clearly
- [x] Document backend Prisma client generation path
- [x] Add developer setup notes for Supabase, cookies, and migrations

### Testing

- [x] Add backend auth integration tests
- [x] Add backend shipment/truck/booking/trip tests
- [x] Add frontend auth/session restore tests
- [x] Add smoke-test script for local startup checks

### Dev Environment

- [x] Complete `docker-compose.yml`
- [x] Add Redis service only for pub-sub setup
- [x] Add backend and frontend container startup docs
- [x] Add secret rotation and production cookie guidance

## Next Priority

These should be the next implementation targets after the local Phase 2 closeout.

1. Complete optimization backend and ML integration
2. Complete tracking backend and realtime pub-sub
3. Complete return-load workflow
4. Complete analytics and admin backend APIs
5. Finish missing frontend modules for those APIs

## Remaining Project Tasks

### Phase 3 - Optimization

#### Backend

- [ ] Implement optimization routes in `backend/src/routes/optimization.routes.js`
- [ ] Implement optimization controller in `backend/src/controllers/optimization.controller.js`
- [ ] Implement optimization service in `backend/src/services/optimization.service.js`
- [ ] Call ML service for truck scoring
- [ ] Cache optimization results
- [ ] Add truck-fit calculation backend

#### Frontend

- [ ] Implement `frontend/src/api/optimization.api.js`
- [ ] Replace optimization page shell with live API flow
- [ ] Implement `TruckFitCalculator`
- [ ] Add result cards, rank explanations, and cache retrieval flow

#### ML Service

- [ ] Complete scoring logic in `ml-service/app/services/scoring_engine.py`
- [ ] Complete route/fit scoring contracts

### Phase 4 - Tracking And Realtime

#### Backend

- [ ] Implement tracking routes in `backend/src/routes/tracking.routes.js`
- [ ] Implement tracking controller in `backend/src/controllers/tracking.controller.js`
- [ ] Implement tracking service in `backend/src/services/tracking.service.js`
- [ ] Add Redis client in `backend/src/config/redis.js`
- [ ] Add Socket.IO setup in `backend/src/config/socket.js`
- [ ] Add trip socket handlers
- [ ] Add location socket handlers
- [ ] Add notification socket handlers
- [ ] Add Redis pub-sub adapter for Socket.IO

#### Frontend

- [ ] Implement `frontend/src/hooks/useSocket.js`
- [ ] Implement `frontend/src/store/notificationStore.js`
- [ ] Implement `frontend/src/store/tripStore.js`
- [ ] Implement notification bell
- [ ] Implement live trip updates on tracking screens
- [ ] Implement map markers and route polyline components

### Phase 5 - Return Load Workflow

#### Backend

- [ ] Implement return-load routes in `backend/src/routes/returnLoad.routes.js`
- [ ] Implement return-load controller in `backend/src/controllers/returnLoad.controller.js`
- [ ] Implement return-load service in `backend/src/services/returnLoad.service.js`
- [ ] Trigger matching when trip is delivered
- [ ] Send return-load notifications

#### Frontend

- [ ] Implement `frontend/src/api/returnLoad.api.js`
- [ ] Implement `frontend/src/hooks/useReturnLoad.js`
- [ ] Implement `frontend/src/pages/dealer/ReturnLoadPage.jsx`
- [ ] Implement return-load cards, panel, and badge

#### ML Service

- [ ] Complete return-load scoring integration

### Phase 6 - Analytics And Admin

#### Backend Analytics

- [ ] Implement analytics routes in `backend/src/routes/analytics.routes.js`
- [ ] Implement analytics controller in `backend/src/controllers/analytics.controller.js`
- [ ] Implement analytics service in `backend/src/services/analytics.service.js`
- [ ] Add KPI endpoint
- [ ] Add utilization series endpoint
- [ ] Add revenue series endpoint
- [ ] Add CO2 series endpoint
- [ ] Add demand forecast endpoint
- [ ] Add CO2 report download endpoint

#### Backend Admin

- [ ] Implement admin routes in `backend/src/routes/admin.routes.js`
- [ ] Implement admin controller in `backend/src/controllers/admin.controller.js`
- [ ] Implement admin service in `backend/src/services/admin.service.js`
- [ ] Add user management endpoints
- [ ] Add user status update endpoint
- [ ] Add dispute listing and dispute resolution endpoints

#### Frontend

- [ ] Implement `frontend/src/api/analytics.api.js`
- [ ] Implement `frontend/src/pages/admin/UserManagementPage.jsx`
- [ ] Implement `frontend/src/pages/admin/DisputePage.jsx`
- [ ] Connect analytics pages to real backend analytics APIs

### Phase 7 - CO2, Documents, Notifications

#### Backend

- [ ] Implement `backend/src/services/co2.service.js`
- [ ] Implement `backend/src/services/invoice.service.js`
- [ ] Implement `backend/src/services/notification.service.js`
- [ ] Implement `backend/src/utils/pdfGenerator.utils.js`
- [ ] Generate invoice PDFs
- [ ] Generate CO2 report PDFs
- [ ] Add notification read and mark-all-read logic
- [ ] Add email notification sending

### Phase 8 - Background Jobs

- [ ] Implement booking timeout cron job
- [ ] Implement GPS simulator job
- [ ] Implement return-load trigger job
- [ ] Implement ML retrain job

### Phase 9 - ML Service Completion

- [ ] Complete VRP solver in `ml-service/app/services/vrp_solver.py`
- [ ] Complete scoring engine in `ml-service/app/services/scoring_engine.py`
- [ ] Verify all ML routers are reachable from backend
- [ ] Standardize request/response contracts between Node and FastAPI
- [ ] Add ML error handling and fallback behavior

### Phase 10 - UI System Completion

- [ ] Add proper navbar
- [ ] Add role-based sidebar
- [ ] Add global error boundary
- [ ] Add notification dropdown
- [ ] Add reusable form feedback and empty states
- [ ] Add success toasts and mutation feedback
- [ ] Polish mobile responsiveness across dashboards and detail pages

## Later

- [ ] Add audit logs
- [ ] Add document upload flow with MinIO
- [ ] Add dealer pickup and delivery zone mapping UI
- [ ] Add advanced booking pricing breakdown UI
- [ ] Add richer admin reporting
- [ ] Add exportable operational reports

## Low Priority

- [ ] CI/CD pipeline
- [ ] Automated deployment
- [ ] Observability and metrics dashboards
- [ ] Performance/load testing
- [ ] Security hardening review
- [ ] Backup and recovery documentation
- [ ] API reference documentation

## Recommended Execution Order

1. Implement optimization backend + ML integration
2. Implement tracking backend + Redis pub-sub + sockets
3. Implement return-load workflow
4. Implement analytics and admin APIs
5. Complete missing frontend integrations
6. Complete jobs, notifications, PDFs, and infra
7. Finish production readiness work
