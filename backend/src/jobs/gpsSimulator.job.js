// === backend/src/jobs/gpsSimulator.job.js ===
// Purpose: Simulate truck GPS movement along OSRM route during development
// Dependencies: ../config/db, ../services/tracking.service

/**
 * TODO: Implement GPS simulator
 *
 * HOW IT WORKS:
 * 1. When a trip status changes to IN_TRANSIT, this job starts for that trip
 * 2. Fetch the full OSRM route geometry (array of [lat,lng] waypoints) from DB
 * 3. Every 10 seconds, emit the next waypoint as a 'location:update' socket event
 *    to the trip's Socket.io room: { tripId, lat, lng, speed: 60, timestamp }
 * 4. When all waypoints are exhausted, stop the job and emit 'trip:route:complete'
 * 5. Also save each GPS point to gps_logs table (insert only, never update)
 *
 * IMPLEMENTATION:
 *   const activeSimulators = new Map(); // Map<tripId, intervalId>
 *
 *   Example startSimulator(tripId): fetch route and start an interval.
 *   Example stopSimulator(tripId): clear the interval and delete from the map.
 *
 * In production: replace with real driver GPS from mobile app
 *
 * Called by: trip.service.startTrip()
 */

// module.exports = { startSimulator, stopSimulator };
