import api from './axiosInstance';

export const getShipments = (params) => api.get('/shipments', { params });
export const getShipmentById = (id) => api.get(`/shipments/${id}`);
export const createShipment = (payload) => api.post('/shipments', payload);
export const updateShipment = (id, payload) => api.put(`/shipments/${id}`, payload);
export const deleteShipment = (id) => api.delete(`/shipments/${id}`);
export const batchUpdateStatus = (payload) =>
  api.patch('/shipments/batch-status', payload);
