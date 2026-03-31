// === frontend/src/api/booking.api.js ===
// Purpose: Booking request workflow API calls
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement createBookingRequest
 * POST /bookings
 * Called by: warehouse after selecting a truck from optimization results
 * @param {{ shipmentIds: string[], truckId: string, quotedPrice: number }} data
 * @returns {Promise<object>} Created booking request
 */
// export const createBookingRequest = (data) => api.post('/bookings', data);

/**
 * TODO: Implement getBookingRequests
 * GET /bookings?status=...&role=...
 * - Warehouse: sees their sent requests
 * - Dealer: sees requests for their trucks
 * @param {{ status?: string, page?: number }} params
 * @returns {Promise<{ bookings: array, total: number }>}
 */
// export const getBookingRequests = (params) => api.get('/bookings', { params });

/**
 * TODO: Implement respondToBooking (dealer action)
 * PATCH /bookings/:id/respond
 * @param {string} id
 * @param {{ action: 'APPROVE'|'REJECT'|'COUNTER', counterPrice?: number, dealerNote?: string }} data
 * @returns {Promise<object>}
 */
// export const respondToBooking = (id, data) => api.patch(`/bookings/${id}/respond`, data);

/**
 * TODO: Implement acceptCounterOffer (warehouse action)
 * PATCH /bookings/:id/accept-counter
 * @param {string} id
 * @returns {Promise<object>} Updated booking with trip creation
 */
// export const acceptCounterOffer = (id) => api.patch(`/bookings/${id}/accept-counter`);

/**
 * TODO: Implement getBookingById
 * GET /bookings/:id
 * @param {string} id
 * @returns {Promise<object>} Full booking with shipment and truck details
 */
// export const getBookingById = (id) => api.get(`/bookings/${id}`);
