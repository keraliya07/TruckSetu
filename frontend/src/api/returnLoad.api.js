import api from './axiosInstance';

export const getReturnLoadMatches = (params) => api.get('/return-loads', { params });

export const acceptReturnLoad = (matchId) => api.post(`/return-loads/${matchId}/accept`);

export const rejectReturnLoad = (matchId) => api.post(`/return-loads/${matchId}/reject`);
