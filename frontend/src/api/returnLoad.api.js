// === frontend/src/api/returnLoad.api.js ===
// Purpose: Return load matching API calls
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement getReturnLoadMatches
 * GET /return-loads?tripId=...&status=...
 * Called by: ReturnLoadPage (dealer views available return loads)
 * @param {{ tripId?: string, status?: string }} params
 * @returns {Promise<{ matches: array }>}
 *   Each match: { id, shipment, proximityScore, directionScore, utilizationScore, combinedScore, expiresAt }
 */
// export const getReturnLoadMatches = (params) => api.get('/return-loads', { params });

/**
 * TODO: Implement acceptReturnLoad
 * POST /return-loads/:matchId/accept
 * Called by: Dealer accepts a return load match
 * @param {string} matchId
 * @returns {Promise<{ bookingRequest: object, newTrip: object }>}
 */
// export const acceptReturnLoad = (matchId) => api.post(`/return-loads/${matchId}/accept`);

/**
 * TODO: Implement rejectReturnLoad
 * POST /return-loads/:matchId/reject
 * @param {string} matchId
 * @returns {Promise<void>}
 */
// export const rejectReturnLoad = (matchId) => api.post(`/return-loads/${matchId}/reject`);
