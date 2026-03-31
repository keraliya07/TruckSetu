// === backend/src/services/shipment.service.js ===
// Purpose: Shipment CRUD business logic
// Dependencies: ../config/db

// const prisma = require('../config/db');  // TODO: uncomment

/**
 * TODO: Implement getAll — List shipments for a warehouse user
 * @param {{ status, page, limit, search }} filters
 * @param {string} warehouseId — From authenticated user
 * @returns {Promise<{ shipments, total, page }>}
 *
 * Prisma: prisma.shipment.findMany({ where: { warehouseId, status }, skip, take, orderBy: { createdAt: 'desc' } })
 */

/**
 * TODO: Implement getById
 * Prisma: prisma.shipment.findUnique({ where: { id }, include: { tripShipments: { include: { trip: true } }, bookingRequests: true } })
 */

/**
 * TODO: Implement create
 * Auto-fill originCity, originLat, originLng from the user's warehouse
 */

/**
 * TODO: Implement update (only DRAFT status)
 * TODO: Implement remove (only DRAFT status)
 * TODO: Implement batchUpdateStatus (validate state transitions)
 */

// module.exports = { getAll, getById, create, update, remove, batchUpdateStatus };
