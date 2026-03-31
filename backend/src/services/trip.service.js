// === backend/src/services/trip.service.js ===
// Purpose: Trip lifecycle — creation, start, stop management, completion
// Dependencies: ../config/db, ./tracking.service, ./notification.service

// const prisma = require('../config/db');  // TODO: uncomment

/**
 * TODO: Implement createTrip — Called by booking.service when booking is approved
 * @param {{ truckId, shipmentIds, routeData, estimatedCost }} data
 *
 * Steps:
 *   1. Create Trip record with status PLANNED
 *   2. Create TripStop records from routeData.orderedStops
 *   3. Create TripShipment junction records
 *   4. Update all shipment statuses to BOOKING_CONFIRMED
 *   5. Store OSRM route geometry as JSON
 *   6. Return complete trip with stops and shipments
 */

/**
 * TODO: Implement startTrip — Dealer starts a trip
 * 1. Validate dealer owns this trip
 * 2. Update status → IN_TRANSIT, startedAt = NOW
 * 3. Start GPS simulator job for this trip
 * 4. Notify all warehouses with shipments on this trip
 */

/**
 * TODO: Implement completeStop — Dealer marks a stop as completed
 * Delegates to tracking.service.completeStop
 */

// module.exports = { createTrip, getAll, getById, startTrip, completeStop, getRoute };
