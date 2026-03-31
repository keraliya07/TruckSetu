// === frontend/src/store/tripStore.js ===
// Purpose: Zustand store for active trip tracking state
// Dependencies: zustand, ../api/trip.api

// import { create } from 'zustand';           // TODO: uncomment
// import * as tripApi from '../api/trip.api';  // TODO: uncomment

/**
 * TODO: Create tripStore
 *
 * STATE:
 *   trips: array                 — List of trips (dealer: their trips, warehouse: trips with their shipments)
 *   activeTrip: object | null    — Currently tracked trip with real-time data
 *   truckLocation: { lat, lng, speed, timestamp } — Latest GPS position
 *   stops: array                 — Ordered stop list with statuses
 *   isLoading: boolean
 *
 * ACTIONS:
 *   fetchTrips(params)           — Load trips list
 *   setActiveTrip(trip)          — Set trip for tracking view
 *   updateTruckLocation(data)    — Called by socket event handler
 *   updateStopStatus(stopId, status) — Called by socket event handler
 *   startTrip(tripId)            — Dealer starts trip
 *   completeStop(tripId, stopId) — Dealer marks stop complete
 *
 * Called by: TrackingPage, TripManagePage, useTracking hook
 */
