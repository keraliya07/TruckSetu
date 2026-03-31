// === frontend/src/hooks/useTracking.js ===
// Purpose: Custom hook for real-time trip tracking via Socket.io
// Dependencies: ./useSocket, ../store/tripStore

// import { useEffect, useCallback } from 'react';   // TODO: uncomment
// import { useSocket } from './useSocket';             // TODO: uncomment
// import { useTripStore } from '../store/tripStore';   // TODO: uncomment

/**
 * TODO: Implement useTracking hook
 *
 * Purpose: Subscribe to real-time GPS updates for a specific trip
 *
 * @param {string} tripId — The trip to track
 *
 * Steps:
 *   1. On mount: join socket room `trip:${tripId}`
 *   2. Listen for 'location:update' events → update tripStore.truckLocation
 *      Event payload: { tripId, lat, lng, speed, heading, timestamp }
 *   3. Listen for 'trip:stop:completed' → update tripStore.stops
 *      Event payload: { tripId, stopId, status, arrivedAt }
 *   4. Listen for 'trip:eta:updated' → update ETA display
 *      Event payload: { tripId, stops: [{ stopId, estimatedArrival }] }
 *   5. Listen for 'trip:route:complete' → trip finished notification
 *   6. On unmount: leave socket room, remove listeners
 *
 * Returns:
 *   truckLocation: { lat, lng, speed, heading }
 *   stops: array of stops with statuses
 *   isLive: boolean (socket connected and receiving updates)
 *   eta: { nextStop: Date, finalStop: Date }
 *
 * Called by: TrackingPage, TripManagePage
 */

// export function useTracking(tripId) {
//   // TODO: Implement real-time tracking subscription
// }
