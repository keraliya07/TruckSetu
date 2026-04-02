import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { useTripStore } from '../store/tripStore';

function interpolatePosition(stops, progressRatio) {
  if (!stops.length) {
    return null;
  }

  const completedStops = stops.filter((stop) => stop.status === 'COMPLETED');
  const from = completedStops[completedStops.length - 1] || stops[0];
  const to = stops.find((stop) => stop.status !== 'COMPLETED') || stops[stops.length - 1];

  if (!from || !to) {
    return null;
  }

  return {
    lat: from.lat + (to.lat - from.lat) * progressRatio,
    lng: from.lng + (to.lng - from.lng) * progressRatio,
  };
}

export function useTracking(tripId) {
  const { user } = useAuth();
  const {
    emitLocationUpdate,
    joinTrip,
    leaveTrip,
    socket,
  } = useSocket();
  const trip = useTripStore((state) => state.activeTrip);
  const stops = useTripStore((state) => state.stops);
  const truckLocation = useTripStore((state) => state.truckLocation);
  const locationHistory = useTripStore((state) => state.locationHistory);
  const isLoading = useTripStore((state) => state.isLoading);
  const error = useTripStore((state) => state.error);
  const fetchTripById = useTripStore((state) => state.fetchTripById);
  const clearActiveTrip = useTripStore((state) => state.clearActiveTrip);
  const startTripAction = useTripStore((state) => state.startTrip);
  const completeStopAction = useTripStore((state) => state.completeStop);
  const [busyStopId, setBusyStopId] = useState(null);
  const [movementTick, setMovementTick] = useState(0);

  const refresh = useCallback(async () => fetchTripById(tripId), [fetchTripById, tripId]);

  useEffect(() => {
    refresh().catch(() => {});
    return () => {
      clearActiveTrip();
    };
  }, [clearActiveTrip, refresh]);

  useEffect(() => {
    if (!tripId) {
      return undefined;
    }

    joinTrip(tripId);
    return () => leaveTrip(tripId);
  }, [joinTrip, leaveTrip, tripId, socket]);

  useEffect(() => {
    if (trip?.status !== 'IN_TRANSIT') {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setMovementTick((tick) => (tick + 1) % 20);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [trip?.status]);

  useEffect(() => {
    if (
      user?.role !== 'DEALER' ||
      trip?.status !== 'IN_TRANSIT' ||
      !tripId ||
      !socket
    ) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const position = interpolatePosition(stops, movementTick / 20);
      if (!position) {
        return;
      }

      emitLocationUpdate({
        tripId,
        lat: position.lat,
        lng: position.lng,
        source: 'DEALER_LIVE',
        recordedAt: new Date().toISOString(),
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [emitLocationUpdate, movementTick, socket, stops, trip?.status, tripId, user?.role]);

  const nextStop = stops.find((stop) => stop.status !== 'COMPLETED') || null;
  const completedStops = stops.filter((stop) => stop.status === 'COMPLETED').length;

  const eta = useMemo(() => {
    if (!stops.length) {
      return {
        nextStop: null,
        finalStop: null,
        nextStopCity: null,
      };
    }

    const remainingStops = stops.filter((stop) => stop.status !== 'COMPLETED').length || 1;
    const nextStopHours = trip?.status === 'DELIVERED' ? 0 : 1.1;
    const finalHours = trip?.status === 'DELIVERED' ? 0 : remainingStops * 1.5;
    const now = Date.now();

    return {
      nextStop: new Date(now + nextStopHours * 3600000),
      finalStop: new Date(now + finalHours * 3600000),
      nextStopCity: nextStop?.city || stops[stops.length - 1]?.city || null,
    };
  }, [nextStop?.city, stops, trip?.status]);

  const progress = useMemo(() => {
    const totalDistanceKm = Number(trip?.estimatedDistanceKm || 0);
    const distanceCoveredKm =
      stops.length === 0 ? 0 : (completedStops / stops.length) * totalDistanceKm;

    return {
      completedStops,
      totalStops: stops.length,
      distanceCoveredKm,
      totalDistanceKm,
    };
  }, [completedStops, stops.length, trip?.estimatedDistanceKm]);

  const startTrip = useCallback(async () => {
    await startTripAction(tripId);
  }, [startTripAction, tripId]);

  const completeStop = useCallback(
    async (stopId) => {
      setBusyStopId(stopId);
      try {
        await completeStopAction(tripId, stopId);
      } finally {
        setBusyStopId(null);
      }
    },
    [completeStopAction, tripId]
  );

  const fallbackTruckPosition = useMemo(() => {
    if (truckLocation) {
      return truckLocation;
    }

    return interpolatePosition(stops, movementTick / 20);
  }, [movementTick, stops, truckLocation]);

  return {
    busyStopId,
    completeStop,
    error,
    eta,
    isLoading,
    progress,
    refresh,
    locationHistory,
    startTrip,
    stops,
    trip,
    truckPosition: fallbackTruckPosition,
  };
}
