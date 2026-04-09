import api from './axiosInstance';

export const truckFitEstimate = (payload) =>
  api.post('/optimization/truck-fit', payload);
