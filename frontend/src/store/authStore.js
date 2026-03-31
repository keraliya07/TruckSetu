// === frontend/src/store/authStore.js ===
// Purpose: Zustand store for authentication state (token, user, login/logout actions)
// Dependencies: zustand, ../api/auth.api

// import { create } from 'zustand';               // TODO: uncomment
// import { persist } from 'zustand/middleware';    // TODO: uncomment
// import * as authApi from '../api/auth.api';      // TODO: uncomment

/**
 * TODO: Create authStore with Zustand
 *
 * STATE:
 *   token: string | null         — JWT token (persisted to localStorage)
 *   user: object | null          — { id, email, role, name, warehouse?, truckDealer? }
 *   isAuthenticated: boolean     — Derived from !!token
 *   isLoading: boolean           — Login/register in progress
 *   error: string | null         — Last auth error message
 *
 * ACTIONS:
 *   login(email, password)       — Call authApi.login, set token + user
 *   register(data)               — Call authApi.register, set token + user
 *   fetchProfile()               — Call authApi.getProfile, update user object
 *   logout()                     — Clear token + user, redirect to /login
 *   clearError()                 — Reset error state
 *
 * PERSISTENCE:
 *   Use zustand/persist middleware to persist 'token' in localStorage
 *   Key: 'stlos-auth'
 *
 * EXAMPLE:
 *   export const useAuthStore = create(
 *     persist(
 *       (set, get) => ({
 *         token: null,
 *         user: null,
 *         isLoading: false,
 *         error: null,
 *         get isAuthenticated() { return !!get().token; },
 *         login: async (email, password) => {
 *           set({ isLoading: true, error: null });
 *           try {
 *             const { token, user } = await authApi.login({ email, password });
 *             set({ token, user, isLoading: false });
 *           } catch (err) {
 *             set({ error: err.message, isLoading: false });
 *           }
 *         },
 *         // TODO: implement register, fetchProfile, logout, clearError
 *       }),
 *       { name: 'stlos-auth', partialize: (state) => ({ token: state.token }) }
 *     )
 *   );
 */
