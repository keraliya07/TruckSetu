// === backend/src/sockets/location.socket.js ===
// Purpose: Receive and broadcast GPS location updates
// Dependencies: ../services/tracking.service

/**
 * TODO: Implement registerLocationSocket(io, socket)
 *
 * Events:
 *   'location:update' — { tripId, lat, lng, speed, heading, timestamp }
 *   → Validate dealer owns trip
 *   → trackingService.broadcastLocation(tripId, payload)
 *   → Store in Redis + gps_logs table (throttled)
 */

// function registerLocationSocket(io, socket) { /* TODO */ }
// module.exports = { registerLocationSocket };
