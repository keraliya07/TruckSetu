// === backend/src/services/truck.service.js ===
// Purpose: Truck fleet management business logic
// Dependencies: ../config/db

// const prisma = require('../config/db');  // TODO: uncomment

/**
 * TODO: Implement getAll — List trucks for a dealer
 * @param {{ status, page, limit }} filters
 * @param {string} dealerId
 * @returns {Promise<{ trucks, total }>}
 */

/**
 * TODO: Implement getById
 * Include: { dealer: true, trips: { take: 10, orderBy: { createdAt: 'desc' } } }
 */

/**
 * TODO: Implement create — Register new truck
 * Validate: dealerId owns the request, registrationNo is unique
 */

/**
 * TODO: Implement update — Update truck details
 * TODO: Implement updateStatus — Change AVAILABLE/MAINTENANCE/INACTIVE
 * Validate: Cannot set AVAILABLE if currently ON_TRIP
 */

/**
 * TODO: Implement remove — Soft delete (set isActive = false)
 * Validate: No active trips
 */

// module.exports = { getAll, getById, create, update, updateStatus, remove };
