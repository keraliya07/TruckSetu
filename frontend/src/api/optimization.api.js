import api from './axiosInstance';

export const runOptimization = (payload) => api.post('/optimization/score', payload);

export const getOptimizationResult = (cacheKey) =>
  api.get(`/optimization/result/${cacheKey}`);

export const getOptimizationHistory = (params) =>
  api.get('/optimization/history', { params });

export const truckFitEstimate = (payload) =>
  api.post('/optimization/truck-fit', payload);
