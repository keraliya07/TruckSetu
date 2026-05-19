import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import HomePage from './pages/HomePage';
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
const OptimizationHistoryPage = lazy(() => import('./pages/warehouse/OptimizationHistoryPage'));
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
