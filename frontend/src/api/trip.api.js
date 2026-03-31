// === frontend/src/api/trip.api.js ===
// Purpose: Trip lifecycle API calls
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement getTrips
 * GET /trips?status=...&page=...
 * @param {{ status?: string, page?: number }} params
 * @returns {Promise<{ trips: array, total: number }>}
 */
// export const getTrips = (params) => api.get('/trips', { params });

/**
 * TODO: Implement getTripById
 * GET /trips/:id
 * @param {string} id
 * @returns {Promise<object>} Trip with stops, shipments, GPS logs, truck details
 */
// export const getTripById = (id) => api.get(`/trips/${id}`);

/**
 * TODO: Implement startTrip (dealer action)
 * PATCH /trips/:id/start
 * @param {string} id
 * @returns {Promise<object>} Trip with status IN_TRANSIT
 */
// export const startTrip = (id) => api.patch(`/trips/${id}/start`);

/**
 * TODO: Implement completeStop (dealer action)
 * PATCH /trips/:id/stops/:stopId/complete
 * @param {string} tripId
 * @param {string} stopId
 * @returns {Promise<object>} Updated stop + recalculated ETAs
 */
// export const completeStop = (tripId, stopId) => api.patch(`/trips/${tripId}/stops/${stopId}/complete`);

/**
 * TODO: Implement getTripRoute
 * GET /trips/:id/route
 * @param {string} id
 * @returns {Promise<{ geometry: GeoJSON, stops: array, totalDistanceKm: number }>}
 */
// export const getTripRoute = (id) => api.get(`/trips/${id}/route`);
