import api from './axiosInstance';

export function getUsers(params) {
  return api.get('/admin/users', { params });
}

export function createAnalyst(body) {
  return api.post('/admin/analysts', body);
}

export function getUserById(id) {
  return api.get(`/admin/users/${id}`);
}

export function updateUserStatus(id, body) {
  return api.patch(`/admin/users/${id}/status`, body);
}
