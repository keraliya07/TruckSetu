import { Suspense, lazy, useEffect } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useAuthStore } from './store/authStore';
import { getDashboardPath } from './utils/roleRoutes';

const AddAnalystPage = lazy(() => import('./pages/admin/AddAnalystPage'));
const AnalystManagementPage = lazy(() => import('./pages/admin/AnalystManagementPage'));
const SystemAnalyticsPage = lazy(() => import('./pages/admin/SystemAnalyticsPage'));
const TripInvoicesPage = lazy(() => import('./pages/admin/TripInvoicesPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const AddTruckPage = lazy(() => import('./pages/dealer/AddTruckPage'));
const BookingRequestsPage = lazy(() => import('./pages/dealer/BookingRequestsPage'));
const DealerAnalyticsPage = lazy(() => import('./pages/dealer/DealerAnalyticsPage'));
const FleetPage = lazy(() => import('./pages/dealer/FleetPage'));
const ReturnLoadPage = lazy(() => import('./pages/dealer/ReturnLoadPage'));
const TripManagePage = lazy(() => import('./pages/dealer/TripManagePage'));
const TruckDetailPage = lazy(() => import('./pages/dealer/TruckDetailPage'));
const BookingDetailPage = lazy(() => import('./pages/shared/BookingDetailPage'));
const BookingPage = lazy(() => import('./pages/warehouse/BookingPage'));
const CreateShipmentPage = lazy(() => import('./pages/warehouse/CreateShipmentPage'));
const ShipmentDetailPage = lazy(() => import('./pages/warehouse/ShipmentDetailPage'));
const ShipmentHistoryPage = lazy(() => import('./pages/warehouse/ShipmentHistoryPage'));
const ShipmentListPage = lazy(() => import('./pages/warehouse/ShipmentListPage'));
const TruckEstimationPage = lazy(() => import('./pages/warehouse/TruckEstimationPage'));
const TrackingPage = lazy(() => import('./pages/warehouse/TrackingPage'));

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

  const roles = [
    { name: 'Warehouse', desc: 'Create shipments, compare truck matches, and track approved trips.', color: 'from-emerald-500 to-teal-600', glow: 'hover:shadow-emerald-500/15' },
    { name: 'Dealer', desc: 'Manage fleet availability, negotiate bookings, and run trip operations.', color: 'from-freight-500 to-freight-700', glow: 'hover:shadow-freight-500/15' },
    { name: 'Admin', desc: 'Review platform rollout and live system analytics from the command layer.', color: 'from-accent-500 to-accent-700', glow: 'hover:shadow-accent-500/15' },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.4), transparent 70%)' }}
        />
        <div
          className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 animate-fade-in lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-hover overflow-hidden">
          <div
            className="relative p-8 text-white sm:p-10"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #115e59 40%, #4f46e5 80%, #0f172a 100%)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.12) 0%, transparent 50%)'
            }} />
            <p className="relative font-heading text-sm uppercase tracking-[0.35em] text-white/60">
              TruckSetu
            </p>
            <h1 className="relative mt-5 max-w-3xl font-heading text-4xl leading-tight sm:text-5xl">
              Smart truck logistics for every route, load, and role.
            </h1>
            <p className="relative mt-4 max-w-2xl text-base text-white/75 sm:text-lg">
              A multi-role logistics platform with real shipment, fleet, booking, tracking,
              truck estimation, and analytics foundations now running on live backend services.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {roles.map((role, index) => (
              <div
                key={role.name}
                className={`group rounded-2xl border border-slate-200/60 bg-white/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-lg ${role.glow} animate-fade-in`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${role.color} font-heading text-xs font-bold text-white shadow-md`}>
                  {role.name[0]}
                </div>
                <p className="font-heading text-lg text-slate-900">{role.name}</p>
                <p className="mt-2 text-sm text-slate-500">{role.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="panel-hover p-6 sm:p-8">
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-freight-600">
              Start Here
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Jump into a demo workspace or create your own account to explore the platform.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link className="btn-primary text-center" to="/login">
                Sign in with a demo account
              </Link>
              <Link className="btn-secondary text-center" to="/register">
                Create a warehouse or dealer account
              </Link>
            </div>
          </div>
        </section>
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
        path="/dashboard/warehouse"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <Navigate replace to="/warehouse/shipments" />
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
        path="/warehouse/shipments/history"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <ShipmentHistoryPage />
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
              <Navigate replace to="/warehouse/bookings" />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouse/truck-estimation"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['WAREHOUSE']}>
              <LazyPage>
                <TruckEstimationPage />
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
              <Navigate replace to="/dealer/fleet" />
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
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
              <LazyPage>
                <SystemAnalyticsPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN']}>
              <LazyPage>
                <TripInvoicesPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
              <LazyPage>
                <UserManagementPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analysts"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN']}>
              <LazyPage>
                <AnalystManagementPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analysts/new"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN']}>
              <LazyPage>
                <AddAnalystPage />
              </LazyPage>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
