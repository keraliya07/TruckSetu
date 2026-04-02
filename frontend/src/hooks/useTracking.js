import { useCallback, useEffect, useMemo, useState } from 'react';

import * as tripApi from '../api/trip.api';

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
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyStopId, setBusyStopId] = useState(null);
  const [movementTick, setMovementTick] = useState(0);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tripApi.getTripById(tripId);
      setTrip(result);
      return result;
    } catch (loadError) {
      setError(loadError.message);
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    if (trip?.status !== 'IN_TRANSIT') {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setMovementTick((tick) => (tick + 1) % 20);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [trip?.status]);

  const stops = useMemo(
    () => [...(trip?.stops || [])].sort((a, b) => a.sequence - b.sequence),
    [trip?.stops]
  );

  const nextStop = stops.find((stop) => stop.status !== 'COMPLETED') || null;
  const completedStops = stops.filter((stop) => stop.status === 'COMPLETED').length;
  const progressRatio = trip?.status === 'IN_TRANSIT' ? movementTick / 20 : 0;

  const truckPosition = useMemo(() => {
    if (!trip) {
      return null;
    }

    const latestLocation = trip.locations?.[0];
    if (latestLocation) {
      return {
        lat: latestLocation.lat,
        lng: latestLocation.lng,
      };
    }

    return interpolatePosition(stops, progressRatio);
  }, [progressRatio, stops, trip]);

  const eta = useMemo(() => {
    if (!stops.length) {
      return {
        nextStop: null,
        finalStop: null,
        nextStopCity: null,
      };
    }

    const remainingStops = stops.filter((stop) => stop.status !== 'COMPLETED').length || 1;
    const nextStopHours = trip?.status === 'DELIVERED' ? 0 : 1.5;
    const finalHours = trip?.status === 'DELIVERED' ? 0 : remainingStops * 1.7;
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
    await tripApi.startTrip(tripId);
    await refresh();
  }, [refresh, tripId]);

  const completeStop = useCallback(
    async (stopId) => {
      setBusyStopId(stopId);
      try {
        await tripApi.completeStop(tripId, stopId);
        await refresh();
      } finally {
        setBusyStopId(null);
      }
    },
    [refresh, tripId]
  );

  return {
    busyStopId,
    completeStop,
    error,
    eta,
    isLoading,
    progress,
    refresh,
    startTrip,
    stops,
    trip,
    truckPosition,
  };
}
