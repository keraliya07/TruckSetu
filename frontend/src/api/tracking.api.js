import api from './axiosInstance';

export const getLatestLocation = (tripId) => api.get(`/tracking/${tripId}/latest`);

export const getLocationHistory = (tripId, params) =>
  api.get(`/tracking/${tripId}/history`, { params });

export const postLocationUpdate = (tripId, payload) =>
  api.post(`/tracking/${tripId}/location`, payload);
