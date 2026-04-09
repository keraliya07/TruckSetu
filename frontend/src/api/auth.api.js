import api from './axiosInstance';

export const login = (credentials) => api.post('/auth/login', credentials);

export const register = (payload) => api.post('/auth/register', payload);

export const getProfile = () => api.get('/auth/me');

export const updateProfile = (payload) => api.put('/auth/me', payload);

export const logout = () => api.post('/auth/logout');

export const refreshSession = () =>
  api.post('/auth/refresh', {}, {
    skipAuthRefresh: true,
  });

export const forgotPassword = (payload) =>
  api.post('/auth/forgot-password', payload, {
    skipAuthRefresh: true,
  });

export const resetPassword = (payload) =>
  api.post('/auth/reset-password', payload, {
    skipAuthRefresh: true,
  });

export const sendVerificationEmail = () => api.post('/auth/send-verification');

export const verifyEmail = (payload) =>
  api.post('/auth/verify-email', payload, {
    skipAuthRefresh: true,
  });

export const getDemoAccounts = () => api.get('/auth/demo-accounts');
