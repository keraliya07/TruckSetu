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
        const refreshed = await refreshClient.post('/auth/refresh');
        mergeStoredAuth({
          token: refreshed.data.token,
          user: refreshed.data.user,
        });
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshed.data.token}`,
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

    if (error.response?.status === 401) {
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
