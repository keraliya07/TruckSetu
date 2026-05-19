import api from './axiosInstance';

export const truckFitEstimate = (payload) =>
  api.post('/optimization/truck-fit', payload);

export const scoreTrucks = (payload) => api.post('/optimization/score', payload);

export const getOptimizationHistory = (params) => api.get('/optimization/history', { params });

export const getCachedResult = (cacheKey) => api.get(`/optimization/result/${cacheKey}`);
