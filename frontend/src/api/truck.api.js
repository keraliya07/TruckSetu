import api from './axiosInstance';

export const getTrucks = (params) => api.get('/trucks', { params });
export const getTruckById = (id) => api.get(`/trucks/${id}`);
export const addTruck = (payload) => api.post('/trucks', payload);
export const updateTruck = (id, payload) => api.put(`/trucks/${id}`, payload);
export const updateTruckStatus = (id, payload) =>
  api.patch(`/trucks/${id}/status`, payload);
export const deleteTruck = (id) => api.delete(`/trucks/${id}`);
