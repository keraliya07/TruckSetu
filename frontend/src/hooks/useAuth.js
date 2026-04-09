import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const store = useAuthStore();

  return {
    ...store,
    isAuthenticated: Boolean(store.token && store.user),
    isWarehouse: store.user?.role === 'WAREHOUSE',
    isDealer: store.user?.role === 'DEALER',
    isAdmin: store.user?.role === 'ADMIN',
    isAnalyst: store.user?.role === 'ANALYST',
  };
}
