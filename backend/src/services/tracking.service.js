// === backend/src/services/tracking.service.js ===
// Purpose: Real-time GPS tracking — socket room management, location broadcasts, stop completion
// Dependencies: ../config/db, ../config/redis, ../config/socket, ./notification.service

// const prisma = require('../config/db');         // TODO: uncomment
// const redis = require('../config/redis');       // TODO: uncomment
// const { getIO } = require('../config/socket'); // TODO: uncomment

/**
 * TODO: Implement joinTripRoom(socketId, tripId, userId)
 *
 * Steps:
 *   1. Validate user has permission to track this trip:
 *      - Is a warehouse with shipments on this trip, OR
 *      - Is the dealer who owns the truck on this trip
 *   2. socket.join(\`trip:\${tripId}\`)
 *   3. Emit current trip state immediately on join:
 *      - Last known GPS position (from Redis or DB)
 *      - All stop statuses
 *      - Current ETA
 *
 * Called by: sockets/trip.socket.js
 */

/**
 * TODO: Implement broadcastLocation(tripId, locationData)
 *
 * Steps:
 *   1. Publish to Redis channel: \`trip:location:\${tripId}\`
 *      All Node instances subscribed to this channel will relay to their Socket.io clients
 *   2. Emit to Socket.io room: io.to(\`trip:\${tripId}\`).emit('location:update', locationData)
 *   3. Store latest position in Redis: redis.set(\`truck:position:\${truckId}\`, JSON.stringify(locationData))
 *   4. Throttled DB write (max 1 per 30s): update truck.currentLat, truck.currentLng
 *
 * Called by: sockets/location.socket.js, jobs/gpsSimulator.job.js
 */

/**
 * TODO: Implement completeStop(tripId, stopId, dealerId)
 *
 * Steps:
 *   1. Validate dealer owns this trip
 *   2. Update trip_stops.status = 'COMPLETED', trip_stops.arrivedAt = NOW
 *   3. Update shipment.status for all shipments at this stop:
 *      - If PICKUP stop: status → LOADING
 *      - If DELIVERY stop: status → DELIVERED
 *   4. Recalculate ETA for remaining stops using OSRM
 *   5. Broadcast updated stop list to trip room via socket
 *   6. If this was the last stop:
 *      a. Update trip.status → DELIVERED, trip.completedAt = NOW
 *      b. Update truck.status → AVAILABLE
 *      c. Trigger return load matching: require('./returnLoad.service').findReturnLoads(tripId)
 *      d. Notify all warehouses: "Your shipment has been delivered"
 *
 * Called by: trip.controller.completeStop
 * Calls: osrm.utils, notification.service, returnLoad.service
 */

// module.exports = { joinTripRoom, broadcastLocation, completeStop };
