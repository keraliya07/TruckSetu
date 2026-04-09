import api from './axiosInstance';

export const createBookingRequest = (payload) => api.post('/bookings', payload);
export const getBookingRequests = (params) => api.get('/bookings', { params });
export const respondToBooking = (id, payload) =>
  api.patch(`/bookings/${id}/respond`, payload);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
