// === frontend/src/store/bookingStore.js ===
// Purpose: Zustand store for booking request state
// Dependencies: zustand, ../api/booking.api

// import { create } from 'zustand';               // TODO: uncomment
// import * as bookingApi from '../api/booking.api'; // TODO: uncomment

/**
 * TODO: Create bookingStore
 *
 * STATE:
 *   bookings: array              — Booking requests list
 *   activeBooking: object | null — Currently viewed booking
 *   isLoading: boolean
 *
 * ACTIONS:
 *   fetchBookings(params)        — Load booking requests
 *   setActiveBooking(booking)    — Set current booking for modals
 *   respondToBooking(id, action, data) — Dealer responds
 *   acceptCounter(id)            — Warehouse accepts counter-offer
 *
 * Called by: BookingRequestsPage, BookingPage, CounterOfferModal
 */
