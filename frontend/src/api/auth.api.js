// === frontend/src/api/auth.api.js ===
// Purpose: Authentication API calls (login, register, refresh, logout)
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement login
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: { id, email, role, name } }>}
 */
// export const login = (credentials) => api.post('/auth/login', credentials);

/**
 * TODO: Implement register
 * POST /auth/register
 * @param {{ email: string, password: string, name: string, role: 'WAREHOUSE'|'DEALER', phone?: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
// export const register = (data) => api.post('/auth/register', data);

/**
 * TODO: Implement getProfile
 * GET /auth/me
 * @returns {Promise<{ id, email, role, name, warehouse?: object, truckDealer?: object }>}
 */
// export const getProfile = () => api.get('/auth/me');

/**
 * TODO: Implement updateProfile
 * PUT /auth/me
 * @param {object} data - Profile fields to update
 * @returns {Promise<object>} Updated user
 */
// export const updateProfile = (data) => api.put('/auth/me', data);

/**
 * TODO: Implement logout (optional — may just clear local state)
 * POST /auth/logout
 */
// export const logout = () => api.post('/auth/logout');
