// === backend/src/services/optimization.service.js ===
// Purpose: Truck scoring and optimization — calls Python ML service, caches results
// Dependencies: ../config/db, ../config/redis, axios, ../config/env

// const prisma = require('../config/db');              // TODO: uncomment
// const redis = require('../config/redis');            // TODO: uncomment
// const axios = require('axios');                      // TODO: uncomment
// const { PYTHON_ML_URL } = require('../config/env'); // TODO: uncomment

/**
 * TODO: Implement scoreTrucks
 * @param {string[]} shipmentIds — Shipments to optimize
 * @param {string} warehouseId — Requesting warehouse
 * @returns {Promise<{ trucks: array, cacheKey: string }>}
 *
 * Steps:
 *   1. Fetch full shipment records from DB (weight, volume, dest coords, deadline)
 *   2. Compute a batch hash from sorted shipment IDs for cache key
 *   3. Check Redis cache: redis.get(\`optimization:\${batchHash}\`)
 *   4. IMPORTANT: If Redis cache hit, return cached result directly (skip ML call)
 *   5. Fetch all AVAILABLE trucks whose pickup zones include the warehouse city
 *      AND whose delivery zones cover ALL destination cities
 *      Prisma: prisma.truck.findMany({
 *        where: {
 *          status: 'AVAILABLE',
 *          dealer: {
 *            pickupZones: { has: warehouseCity },
 *            deliveryZones: { hasEvery: destinationCities }
 *          }
 *        },
 *        include: { dealer: true }
 *      })
 *   6. Call Python ML service POST /internal/score-trucks with truck + shipment data
 *      Body: { trucks, shipments }
 *      Response: { scoredTrucks: [{truckId, scores, compositeScore}] }
 *   7. Call Python ML service POST /internal/vrp-route for top 5 trucks to get route
 *      For each: POST /internal/vrp-route with truck + shipment nodes
 *      Response: { orderedStops, totalDistanceKm, totalTimeS, feasible }
 *   8. Cache result in Redis: key \`optimization:\${batchHash}\`, TTL: 1800s
 *   9. Return top 10 scored trucks with their pre-computed routes
 *
 * Called by: optimization.controller.scoreTrucks
 * Calls: Python ML service, Prisma, Redis
 */

/**
 * TODO: Implement getCachedResult
 * @param {string} cacheKey
 * @returns {Promise<object | null>}
 */

/**
 * TODO: Implement truckFitEstimate
 * Quick estimate without full optimization — uses static rules
 */

// module.exports = { scoreTrucks, getCachedResult, truckFitEstimate };
