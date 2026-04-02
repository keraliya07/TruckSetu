import api from './axiosInstance';

export const getTrips = (params) => api.get('/trips', { params });
export const getTripById = (id) => api.get(`/trips/${id}`);
export const startTrip = (id) => api.patch(`/trips/${id}/start`);
export const completeStop = (tripId, stopId) =>
  api.patch(`/trips/${tripId}/stops/${stopId}/complete`);
