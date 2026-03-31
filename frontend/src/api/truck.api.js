// === frontend/src/api/truck.api.js ===
// Purpose: Truck fleet management API calls for dealer users
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement getTrucks
 * GET /trucks?status=...&page=...&limit=...
 * @param {{ status?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ trucks: array, total: number }>}
 */
// export const getTrucks = (params) => api.get('/trucks', { params });

/**
 * TODO: Implement getTruckById
 * GET /trucks/:id
 * @param {string} id
 * @returns {Promise<object>} Full truck with dealer info and trip history
 */
// export const getTruckById = (id) => api.get(`/trucks/${id}`);

/**
 * TODO: Implement addTruck
 * POST /trucks
 * @param {{ registrationNo, truckType, maxWeightKg, maxVolumeM3, emissionFactor, fuelEfficiency, currentCity }} data
 * @returns {Promise<object>} Created truck
 */
// export const addTruck = (data) => api.post('/trucks', data);

/**
 * TODO: Implement updateTruck
 * PUT /trucks/:id
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
// export const updateTruck = (id, data) => api.put(`/trucks/${id}`, data);

/**
 * TODO: Implement updateTruckStatus
 * PATCH /trucks/:id/status
 * @param {string} id
 * @param {{ status: 'AVAILABLE'|'MAINTENANCE'|'INACTIVE' }} data
 * @returns {Promise<object>}
 */
// export const updateTruckStatus = (id, data) => api.patch(`/trucks/${id}/status`, data);

/**
 * TODO: Implement deleteTruck
 * DELETE /trucks/:id (only if no active trips)
 * @param {string} id
 * @returns {Promise<void>}
 */
// export const deleteTruck = (id) => api.delete(`/trucks/${id}`);
