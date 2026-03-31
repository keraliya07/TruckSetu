// === backend/src/services/booking.service.js ===
// Purpose: Booking request workflow — create, respond, counter-offer, auto-escalate
// Dependencies: ../config/db, ./notification.service, ./trip.service

// const prisma = require('../config/db');  // TODO: uncomment

/**
 * TODO: Implement create — Warehouse creates a booking request
 * @param {{ shipmentIds, truckId, quotedPrice }} data
 *
 * Steps:
 *   1. Validate all shipments belong to the requesting warehouse
 *   2. Validate truck exists and is AVAILABLE
 *   3. Create BookingRequest with status SENT, expiresAt = NOW + 2 hours
 *   4. Send notification to truck's dealer
 *   5. Return created booking
 */

/**
 * TODO: Implement respond — Dealer responds to booking
 * @param {string} bookingId
 * @param {{ action: 'APPROVE'|'REJECT'|'COUNTER', counterPrice?, dealerNote? }} data
 *
 * Steps:
 *   1. Validate dealer owns the truck in this booking
 *   2. Update status based on action:
 *      - APPROVE: status → APPROVED, create trip, update truck status → ON_TRIP
 *      - REJECT: status → REJECTED, notify warehouse
 *      - COUNTER: status → COUNTERED, set counterPrice, notify warehouse
 */

/**
 * TODO: Implement acceptCounter — Warehouse accepts dealer's counter-offer
 * Same as APPROVE but uses counterPrice as final price
 */

// module.exports = { create, getAll, getById, respond, acceptCounter };
