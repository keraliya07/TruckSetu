import { create } from 'zustand';

import * as tripApi from '../api/trip.api';

const sortStops = (stops = []) => [...stops].sort((left, right) => left.sequence - right.sequence);

const sortLocations = (locations = []) =>
  [...locations]
    .map((location) => ({
      id: location.id,
      tripId: location.tripId,
      truckId: location.truckId,
      lat: location.lat,
      lng: location.lng,
      speed: location.speed,
      heading: location.heading,
      source: location.source,
      recordedAt: location.recordedAt,
    }))
    .sort(
      (left, right) =>
        new Date(left.recordedAt || 0).getTime() - new Date(right.recordedAt || 0).getTime()
    );

const resolveTruckPosition = (trip, fallback = null) => {
  const latest = trip?.locations?.[0];
  if (latest) {
    return {
      lat: latest.lat,
      lng: latest.lng,
      speed: latest.speed,
      recordedAt: latest.recordedAt,
    };
  }

  if (fallback) {
    return fallback;
  }

  if (trip?.truck?.currentLat != null && trip?.truck?.currentLng != null) {
    return {
      lat: trip.truck.currentLat,
      lng: trip.truck.currentLng,
    };
  }

  return null;
};

const mergeLocationHistory = (locations = [], incoming) => {
  const next = sortLocations([
    ...locations.filter((location) => location.id !== incoming.id),
    incoming,
  ]);

  return next.slice(-40);
};

export const useTripStore = create((set, get) => ({
  trips: [],
  total: 0,
  activeTrip: null,
  truckLocation: null,
  locationHistory: [],
  stops: [],
  isLoading: false,
  error: null,
  fetchTrips: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await tripApi.getTrips(params);
      set({
        trips: result.trips,
        total: result.total,
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  fetchTripById: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await tripApi.getTripById(tripId);
      const locationHistory = sortLocations(trip.locations || []);

      set({
        activeTrip: trip,
        stops: sortStops(trip.stops),
        truckLocation: resolveTruckPosition(trip),
        locationHistory,
        isLoading: false,
      });
      return trip;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  clearActiveTrip: () =>
    set({
      activeTrip: null,
      truckLocation: null,
      locationHistory: [],
      stops: [],
      error: null,
    }),
  setActiveTrip: (trip) =>
    set({
      activeTrip: trip,
      stops: sortStops(trip?.stops),
      truckLocation: resolveTruckPosition(trip, get().truckLocation),
      locationHistory: sortLocations(trip?.locations || get().locationHistory),
    }),
  applyTripState: (trip) =>
    set((state) => ({
      activeTrip:
        state.activeTrip?.id === trip.id || !state.activeTrip ? trip : state.activeTrip,
      trips: state.trips.map((item) => (item.id === trip.id ? trip : item)),
      stops:
        state.activeTrip?.id === trip.id || !state.activeTrip
          ? sortStops(trip.stops)
          : state.stops,
      truckLocation:
        state.activeTrip?.id === trip.id || !state.activeTrip
          ? resolveTruckPosition(trip, state.truckLocation)
          : state.truckLocation,
      locationHistory:
        state.activeTrip?.id === trip.id || !state.activeTrip
          ? sortLocations(trip.locations || state.locationHistory)
          : state.locationHistory,
    })),
  updateTruckLocation: (location) =>
    set((state) => {
      if (state.activeTrip?.id !== location.tripId) {
        return state;
      }

      const nextLocations = [
        {
          id: location.id || `live-${location.recordedAt}`,
          lat: location.lat,
          lng: location.lng,
          speed: location.speed,
          heading: location.heading,
          recordedAt: location.recordedAt,
          source: location.source,
        },
        ...(state.activeTrip.locations || []).filter((item) => item.id !== location.id),
      ].slice(0, 20);

      return {
        activeTrip: {
          ...state.activeTrip,
          locations: nextLocations,
          truck: {
            ...state.activeTrip.truck,
            currentLat: location.lat,
            currentLng: location.lng,
          },
        },
        truckLocation: {
          lat: location.lat,
          lng: location.lng,
          speed: location.speed,
          heading: location.heading,
          recordedAt: location.recordedAt,
        },
        locationHistory: mergeLocationHistory(state.locationHistory, {
          id: location.id || `live-${location.recordedAt}`,
          tripId: location.tripId,
          truckId: location.truckId,
          lat: location.lat,
          lng: location.lng,
          speed: location.speed,
          heading: location.heading,
          source: location.source,
          recordedAt: location.recordedAt,
        }),
      };
    }),
  startTrip: async (tripId) => {
    const trip = await tripApi.startTrip(tripId);
    get().applyTripState(trip);
    return trip;
  },
  completeStop: async (tripId, stopId) => {
    const trip = await tripApi.completeStop(tripId, stopId);
    get().applyTripState(trip);
    return trip;
  },
  refreshGeometry: async (tripId) => {
    const result = await tripApi.refreshGeometry(tripId);
    get().applyTripState(result.trip);
    return result;
  },
}));
