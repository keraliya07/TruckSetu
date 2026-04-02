import { Suspense, lazy, useEffect } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useAuthStore } from './store/authStore';
import { getDashboardPath } from './utils/roleRoutes';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SystemAnalyticsPage = lazy(() => import('./pages/admin/SystemAnalyticsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const AddTruckPage = lazy(() => import('./pages/dealer/AddTruckPage'));
const BookingRequestsPage = lazy(() => import('./pages/dealer/BookingRequestsPage'));
const DealerAnalyticsPage = lazy(() => import('./pages/dealer/DealerAnalyticsPage'));
const DealerDashboard = lazy(() => import('./pages/dealer/DealerDashboard'));
const FleetPage = lazy(() => import('./pages/dealer/FleetPage'));
const ReturnLoadPage = lazy(() => import('./pages/dealer/ReturnLoadPage'));
const TripManagePage = lazy(() => import('./pages/dealer/TripManagePage'));
const TruckDetailPage = lazy(() => import('./pages/dealer/TruckDetailPage'));
const BookingDetailPage = lazy(() => import('./pages/shared/BookingDetailPage'));
const AccountSecurityPage = lazy(() => import('./pages/shared/AccountSecurityPage'));
const BookingPage = lazy(() => import('./pages/warehouse/BookingPage'));
const CreateShipmentPage = lazy(() => import('./pages/warehouse/CreateShipmentPage'));
const OptimizationPage = lazy(() => import('./pages/warehouse/OptimizationPage'));
const ShipmentDetailPage = lazy(() => import('./pages/warehouse/ShipmentDetailPage'));
const ShipmentListPage = lazy(() => import('./pages/warehouse/ShipmentListPage'));
const TrackingPage = lazy(() => import('./pages/warehouse/TrackingPage'));
const WarehouseDashboard = lazy(() => import('./pages/warehouse/WarehouseDashboard'));

const phases = [
  {
    title: 'Phase 1',
    summary: 'Foundation, auth, dashboards, and protected role-aware routing.',
  },
  {
    title: 'Phase 2',
    summary: 'Supabase-backed Prisma schema, seeded users, and persistent auth.',
  },
  {
    title: 'Phase 3',
    summary: 'Shipment, fleet, booking, optimization, tracking, and analytics workflows.',
  },
];

function RouteLoader() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="panel p-6 sm:p-8">
          <LoadingSpinner label="Loading workspace..." />
        </div>
      </div>
    </main>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

function HomePage() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel overflow-hidden">
          <div className="bg-gradient-to-br from-slate-950 via-freight-700 to-brand-600 p-8 text-white sm:p-10">
            <p className="font-heading text-sm uppercase tracking-[0.35em] text-white/65">
              STLOS
            </p>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl leading-tight sm:text-5xl">
              Smart Truck Loading Optimization System
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
              A multi-role logistics platform with real shipment, fleet, booking, tracking,
              optimization, and analytics foundations now running on live backend services.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-heading text-lg text-slate-900">Warehouse</p>
              <p className="mt-2 text-sm text-slate-600">
                Create shipments, compare truck matches, and track approved trips.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-heading text-lg text-slate-900">Dealer</p>
              <p className="mt-2 text-sm text-slate-600">
                Manage fleet availability, negotiate bookings, and run trip operations.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-heading text-lg text-slate-900">Admin</p>
              <p className="mt-2 text-sm text-slate-600">
                Review platform rollout and live system analytics from the command layer.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="panel p-6 sm:p-8">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-freight-600">
              Start Here
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link className="btn-primary" to="/login">
                Sign in with a demo account
              </Link>
              <Link className="btn-secondary" to="/register">
                Create a warehouse or dealer account
              </Link>
            </div>
          </div>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-slate-950">Current rollout</h2>
            <div className="mt-5 space-y-3">
              {phases.map((phase) => (
                <div
                  key={phase.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <p className="font-semibold text-slate-900">{phase.title}</p>
                  <p className="mt-2 text-sm text-slate-600">{phase.summary}</p>
                </div>
              ))}
            </div>
            <Link className="mt-5 inline-block font-semibold text-freight-700" to="/status">
              View detailed roadmap
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="panel p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-signal-600">
            Project Status
          </p>
          <h1 className="mt-4 font-heading text-4xl text-slate-950">Delivery roadmap</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            The repository now spans persistent auth, operational CRUD modules, and the
            product-grade detail, tracking, optimization, and analytics surfaces.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {phases.map((phase) => (
            <article key={phase.title} className="panel p-5">
              <p className="font-heading text-sm uppercase tracking-[0.25em] text-slate-500">
                {phase.title}
              </p>
              <p className="mt-4 text-lg font-semibold text-slate-900">Live now</p>
              <p className="mt-3 text-sm text-slate-600">{phase.summary}</p>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" to="/login">
            Open the current build
          </Link>
          <Link className="btn-secondary" to="/">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  useSocket();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route
        path="/login"
        element={
          <LazyPage>
            <LoginPage />
          </LazyPage>
        }
      />
      <Route
        path="/register"
        element={
          <LazyPage>
            <RegisterPage />
          </LazyPage>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <LazyPage>
            <ForgotPasswordPage />
          </LazyPage>
        }
      />
      <Route
        path="/reset-password"
        element={
          <LazyPage>
            <ResetPasswordPage />
          </LazyPage>
        }
      />
      <Route
        path="/verify-email"
        element={
          <LazyPage>
            <VerifyEmailPage />
          </LazyPage>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <LazyPage>
              <OnboardingPage />
            </LazyPage>
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route
        path="/account/security"
        element={
          <ProtectedRoute>
            <LazyPage>
              <AccountSecurityPage />
            </LazyPage>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/warehouse"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <WarehouseDashboard />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/shipments"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <ShipmentListPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/shipments/new"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <CreateShipmentPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/shipments/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <ShipmentDetailPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/bookings"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <BookingPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/bookings/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <BookingDetailPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/optimization"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <OptimizationPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/tracking/:tripId"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <TrackingPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/dealer"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <DealerDashboard />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/fleet"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <FleetPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/fleet/new"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <AddTruckPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/fleet/:truckId"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <TruckDetailPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/bookings"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <BookingRequestsPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/bookings/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <BookingDetailPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/return-loads"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <ReturnLoadPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/trips/:tripId"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <TripManagePage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dealer/analytics"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['DEALER']}>
              <LazyPage>
                <DealerAnalyticsPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN']}>
              <LazyPage>
                <AdminDashboard />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN']}>
              <LazyPage>
                <SystemAnalyticsPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
