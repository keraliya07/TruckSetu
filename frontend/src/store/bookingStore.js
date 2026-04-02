import { create } from 'zustand';

import * as bookingApi from '../api/booking.api';

const defaultFilters = {
  status: '',
  page: 1,
  limit: 12,
};

export const useBookingStore = create((set, get) => ({
  bookings: [],
  total: 0,
  filters: defaultFilters,
  activeBooking: null,
  isLoading: false,
  error: null,
  fetchBookings: async (overrides = {}) => {
    const filters = { ...get().filters, ...overrides };
    set({ isLoading: true, error: null, filters });

    try {
      const result = await bookingApi.getBookingRequests(filters);
      set({
        bookings: result.bookings,
        total: result.total,
        filters,
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  createBooking: async (payload) => {
    set({ error: null });
    try {
      const booking = await bookingApi.createBookingRequest(payload);
      set((state) => ({ bookings: [booking, ...state.bookings] }));
      return booking;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  respondToBooking: async (id, payload) => {
    set({ error: null });
    try {
      const booking = await bookingApi.respondToBooking(id, payload);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === id ? booking : item)),
      }));
      return booking;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  acceptCounter: async (id, payload) => {
    set({ error: null });
    try {
      const booking = await bookingApi.acceptCounterOffer(id, payload);
      set((state) => ({
        bookings: state.bookings.map((item) => (item.id === id ? booking : item)),
      }));
      return booking;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: key === 'page' ? value : 1,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
