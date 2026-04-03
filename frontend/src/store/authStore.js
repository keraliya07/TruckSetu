import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as authApi from '../api/auth.api';
import { useToastStore } from './toastStore';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      isBootstrapping: true,
      error: null,
      clearError: () => set({ error: null }),
      initializeAuth: async () => {
        const current = useAuthStore.getState();

        if (current.token && current.user) {
          set({ isBootstrapping: false });
          return current.user;
        }

        try {
          const result = await authApi.refreshSession();
          set({
            token: result.token,
            user: result.user,
            isBootstrapping: false,
            error: null,
          });
          return result.user;
        } catch {
          set({
            token: null,
            user: null,
            isBootstrapping: false,
            error: null,
          });
          return null;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authApi.login({ email, password });
          set({
            token: result.token,
            user: result.user,
            isLoading: false,
            isBootstrapping: false,
            error: null,
          });
          useToastStore.getState().success('Signed in', `Welcome back, ${result.user.name}.`);
          return result.user;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const result = await authApi.register(payload);
          set({
            token: result.token,
            user: result.user,
            isLoading: false,
            isBootstrapping: false,
            error: null,
          });
          useToastStore
            .getState()
            .success('Account created', 'Your workspace is ready for onboarding.');
          return result.user;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const user = await authApi.getProfile();
          set({ user, isLoading: false, isBootstrapping: false });
          return user;
        } catch (error) {
          set({ isLoading: false, isBootstrapping: false, error: error.message });
          throw error;
        }
      },
      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const user = await authApi.updateProfile(payload);
          set({ user, isLoading: false });
          useToastStore.getState().success('Profile updated', 'Your account details were saved.');
          return user;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Local logout should still succeed if the session is already invalid.
        } finally {
          set({
            token: null,
            user: null,
            isLoading: false,
            isBootstrapping: false,
            error: null,
          });
          useToastStore
            .getState()
            .info('Signed out', 'Your session has been closed on this device.');
        }
      },
    }),
    {
      name: 'stlos-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
