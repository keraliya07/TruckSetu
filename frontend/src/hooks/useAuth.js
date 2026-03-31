// === frontend/src/hooks/useAuth.js ===
// Purpose: Custom hook wrapping authStore for convenient auth access in components
// Dependencies: ../store/authStore

// import { useAuthStore } from '../store/authStore';  // TODO: uncomment

/**
 * TODO: Implement useAuth hook
 *
 * Purpose: Provide convenient auth state and actions to components
 *
 * Returns:
 *   user             — Current user object
 *   isAuthenticated  — Boolean
 *   isLoading        — Boolean
 *   error            — Error message string
 *   login(email, password)  — Login action
 *   register(data)          — Register action
 *   logout()                — Logout action
 *   isWarehouse      — user?.role === 'WAREHOUSE'
 *   isDealer         — user?.role === 'DEALER'
 *   isAdmin          — user?.role === 'ADMIN'
 *
 * Called by: ProtectedRoute, RoleGuard, Navbar, LoginPage, RegisterPage
 */

// export function useAuth() {
//   const store = useAuthStore();
//   return {
//     ...store,
//     isWarehouse: store.user?.role === 'WAREHOUSE',
//     isDealer: store.user?.role === 'DEALER',
//     isAdmin: store.user?.role === 'ADMIN',
//   };
// }
