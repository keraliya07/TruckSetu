// === frontend/src/api/shipment.api.js ===
// Purpose: Shipment CRUD API calls for warehouse users
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement getShipments
 * GET /shipments?status=...&page=...&limit=...
 * @param {{ status?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ shipments: array, total: number, page: number }>}
 */
// export const getShipments = (params) => api.get('/shipments', { params });

/**
 * TODO: Implement getShipmentById
 * GET /shipments/:id
 * @param {string} id
 * @returns {Promise<object>} Full shipment with relations
 */
// export const getShipmentById = (id) => api.get(`/shipments/${id}`);

/**
 * TODO: Implement createShipment
 * POST /shipments
 * @param {{ weightKg, volumeM3, boxCount, destCity, destLat, destLng, deadline, fragile, hazardous, priority, specialInstructions }} data
 * @returns {Promise<object>} Created shipment
 */
// export const createShipment = (data) => api.post('/shipments', data);

/**
 * TODO: Implement updateShipment
 * PUT /shipments/:id
 * @param {string} id
 * @param {object} data - Fields to update
 * @returns {Promise<object>}
 */
// export const updateShipment = (id, data) => api.put(`/shipments/${id}`, data);

/**
 * TODO: Implement deleteShipment
 * DELETE /shipments/:id  (only DRAFT status)
 * @param {string} id
 * @returns {Promise<void>}
 */
// export const deleteShipment = (id) => api.delete(`/shipments/${id}`);

/**
 * TODO: Implement batchUpdateStatus
 * PATCH /shipments/batch-status
 * @param {{ shipmentIds: string[], status: string }} data
 * @returns {Promise<{ updatedCount: number }>}
 */
// export const batchUpdateStatus = (data) => api.patch('/shipments/batch-status', data);
