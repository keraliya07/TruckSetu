import { beforeEach, describe, expect, test, vi } from 'vitest';

const { authApiMocks } = vi.hoisted(() => ({
  authApiMocks: {
    refreshSession: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../api/auth.api', () => authApiMocks);

import { useAuthStore } from './authStore';

const baseUser = {
  id: 'warehouse-user',
  role: 'WAREHOUSE',
  name: 'Warehouse Lead',
};

function resetStore() {
  useAuthStore.persist.clearStorage();
  window.localStorage.clear();
  useAuthStore.setState({
    token: null,
    user: null,
    isLoading: false,
    isBootstrapping: true,
    error: null,
  });
}

describe('useAuthStore initializeAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  test('keeps an already hydrated session without refreshing', async () => {
    useAuthStore.setState({
      token: 'existing-token',
      user: baseUser,
      isBootstrapping: true,
    });

    const result = await useAuthStore.getState().initializeAuth();

    expect(result).toEqual(baseUser);
    expect(authApiMocks.refreshSession).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });

  test('restores the session from the refresh endpoint when needed', async () => {
    authApiMocks.refreshSession.mockResolvedValue({
      token: 'fresh-token',
      user: baseUser,
    });

    const result = await useAuthStore.getState().initializeAuth();

    expect(authApiMocks.refreshSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual(baseUser);
    expect(useAuthStore.getState().token).toBe('fresh-token');
    expect(useAuthStore.getState().user).toEqual(baseUser);
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });

  test('clears stale auth state when refresh fails', async () => {
    authApiMocks.refreshSession.mockRejectedValue(new Error('Session expired'));
    useAuthStore.setState({
      token: 'stale-token',
      user: null,
      isBootstrapping: true,
    });

    const result = await useAuthStore.getState().initializeAuth();

    expect(result).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isBootstrapping).toBe(false);
  });
});
