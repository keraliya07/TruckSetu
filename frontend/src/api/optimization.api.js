// === frontend/src/api/optimization.api.js ===
// Purpose: Truck optimization and scoring API calls
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement runOptimization
 * POST /optimization/score
 * Called by: OptimizationPage when warehouse submits shipments for truck matching
 * @param {{ shipmentIds: string[] }} data
 * @returns {Promise<{ trucks: array (top 10 scored), cacheKey: string }>}
 *   Each truck includes: { truckId, truckInfo, scores: { utilization, route, cost, co2 }, compositeScore, proposedRoute }
 */
// export const runOptimization = (data) => api.post('/optimization/score', data);

/**
 * TODO: Implement getOptimizationResult (from cache)
 * GET /optimization/result/:cacheKey
 * @param {string} cacheKey
 * @returns {Promise<object>} Cached optimization result
 */
// export const getOptimizationResult = (cacheKey) => api.get(`/optimization/result/${cacheKey}`);

/**
 * TODO: Implement truckFitEstimate
 * POST /optimization/truck-fit
 * Called by: TruckFitCalculator component
 * @param {{ weightKg: number, volumeM3: number, originCity: string, destCity: string }} data
 * @returns {Promise<{ recommendedType: string, estimatedCost: number, estimatedCO2: number }>}
 */
// export const truckFitEstimate = (data) => api.post('/optimization/truck-fit', data);
