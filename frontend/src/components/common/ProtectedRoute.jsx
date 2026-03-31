// === frontend/src/components/common/ProtectedRoute.jsx ===
// Purpose: Route wrapper that redirects unauthenticated users to login
// Dependencies: react-router-dom, ../hooks/useAuth

/**
 * TODO: Implement ProtectedRoute component
 *
 * Purpose: Wrap routes that require authentication
 *
 * Steps:
 *   1. Check isAuthenticated from useAuth()
 *   2. If not authenticated: <Navigate to="/login" replace />
 *   3. If authenticated: render children (via <Outlet /> or children prop)
 *   4. Optional: show LoadingSpinner while auth state is initializing
 *
 * Props:
 *   @param {JSX.Element} children — Route content to protect
 *
 * @returns {JSX.Element}
 */

// export default function ProtectedRoute({ children }) {
//   // TODO: Implement auth check and redirect
// }
