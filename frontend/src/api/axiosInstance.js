import axios from 'axios';

import { clearStoredAuth, mergeStoredAuth, readStoredAuth } from '../utils/authStorage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Refresh-token mutex ---------------------------------------------------
// The backend uses refresh-token rotation: each /auth/refresh call invalidates
// the previous token. If two 401 responses race and both fire a refresh, the
// second one hits "Refresh token reuse detected" which revokes the whole
// session. A simple mutex ensures only one refresh is in-flight at a time.
let refreshPromise = null;

function doRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        mergeStoredAuth({
          token: response.data.token,
          user: response.data.user,
        });
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// --- Interceptors -----------------------------------------------------------
api.interceptors.request.use((config) => {
  const stored = readStoredAuth();
  const token = stored?.state?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {};
    const shouldTryRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !String(originalRequest.url || '').includes('/auth/refresh');

    if (shouldTryRefresh) {
      originalRequest._retry = true;

      try {
        const freshData = await doRefresh();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${freshData.token}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        clearStoredAuth();
        if (typeof window !== 'undefined') {
          window.location.assign('/login');
        }

        const refreshMessage =
          refreshError.response?.data?.error ||
          refreshError.response?.data?.message ||
          refreshError.message ||
          'Session expired';

        return Promise.reject(new Error(refreshMessage));
      }
    }

    if (error.response?.status === 401 && !originalRequest.skipAuthRefresh) {
      clearStoredAuth();
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;
