import api from './axiosInstance';

export function getUsers(params) {
  return api.get('/admin/users', { params });
}

export function getUserById(id) {
  return api.get(`/admin/users/${id}`);
}

export function updateUserStatus(id, body) {
  return api.patch(`/admin/users/${id}/status`, body);
}

export function getDisputes(params) {
  return api.get('/admin/disputes', { params });
}

export function resolveDispute(id, body) {
  return api.patch(`/admin/disputes/${id}/resolve`, body);
}
