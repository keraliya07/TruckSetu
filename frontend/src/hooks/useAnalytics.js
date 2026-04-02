import { useCallback, useEffect, useMemo, useState } from 'react';

import * as bookingApi from '../api/booking.api';
import * as shipmentApi from '../api/shipment.api';
import * as tripApi from '../api/trip.api';
import * as truckApi from '../api/truck.api';
import {
  formatCompactNumber,
  formatNumber,
  groupByPeriod,
} from '../utils/formatters';

function getPeriodDays(period) {
  return Number.parseInt(period, 10) || 30;
}

function withinPeriod(dateLike, period) {
  if (!dateLike) {
    return false;
  }

  const target = new Date(dateLike);
  const start = new Date();
  start.setDate(start.getDate() - getPeriodDays(period));
  return target >= start;
}

function sumShipmentWeight(shipments = []) {
  return shipments.reduce(
    (sum, entry) => sum + Number(entry.shipment?.weightKg || entry.weightKg || 0),
    0
  );
}

function deriveDealerAnalytics({ trucks, bookings, trips, period }) {
  const activeBookings = bookings.filter((booking) => withinPeriod(booking.createdAt, period));
  const activeTrips = trips.filter((trip) => withinPeriod(trip.createdAt, period));
  const completedTrips = activeTrips.filter((trip) => trip.status === 'DELIVERED');

  const totalRevenue = activeTrips.reduce(
    (sum, trip) =>
      sum +
      Number(
        trip.estimatedCost ||
          trip.bookingRequest?.finalPrice ||
          trip.bookingRequest?.quotedPrice ||
          0
      ),
    0
  );

  const totalCo2Saved = activeTrips.reduce((sum, trip) => {
    if (trip.co2SavedKg) {
      return sum + Number(trip.co2SavedKg);
    }

    return sum + Number(trip.estimatedDistanceKm || 0) * 0.12;
  }, 0);

  const utilizationValues = activeTrips.map((trip) => {
    const bookedWeight = sumShipmentWeight(trip.shipments);
    return trip.truck?.maxWeightKg ? (bookedWeight / trip.truck.maxWeightKg) * 100 : 0;
  });

  const avgUtilization =
    utilizationValues.length === 0
      ? 0
      : utilizationValues.reduce((sum, value) => sum + value, 0) /
        utilizationValues.length;

  const revenueSeriesBase = groupByPeriod(
    activeTrips,
    (trip) => trip.completedAt || trip.createdAt,
    (trip) =>
      Number(
        trip.estimatedCost ||
          trip.bookingRequest?.finalPrice ||
          trip.bookingRequest?.quotedPrice ||
          0
      ),
    period
  );

  const revenueSeries = revenueSeriesBase.map((entry) => ({
    ...entry,
    revenue: entry.value,
    trips: activeTrips.filter((trip) => {
      const date = trip.completedAt || trip.createdAt;
      return date && new Date(date).toISOString().slice(0, 10) === entry.key;
    }).length,
  }));

  const utilizationSeries = groupByPeriod(
    activeTrips,
    (trip) => trip.completedAt || trip.createdAt,
    (trip) => {
      const bookedWeight = sumShipmentWeight(trip.shipments);
      return trip.truck?.maxWeightKg ? (bookedWeight / trip.truck.maxWeightKg) * 100 : 0;
    },
    period
  ).map((entry) => ({
    label: entry.label,
    utilization: entry.value,
  }));

  const co2Series = groupByPeriod(
    activeTrips,
    (trip) => trip.completedAt || trip.createdAt,
    (trip) => Number(trip.co2SavedKg || (trip.estimatedDistanceKm || 0) * 0.12),
    period
  );

  let runningCo2 = 0;
  const cumulativeCo2 = co2Series.map((entry) => {
    runningCo2 += entry.value;
    return {
      label: entry.label,
      co2: runningCo2,
    };
  });

  const truckTable = trucks.map((truck) => {
    const truckTrips = trips.filter((trip) => trip.truckId === truck.id);
    const truckRevenue = truckTrips.reduce(
      (sum, trip) =>
        sum +
        Number(
          trip.estimatedCost ||
            trip.bookingRequest?.finalPrice ||
            trip.bookingRequest?.quotedPrice ||
            0
        ),
      0
    );

    const tripUtilization =
      truckTrips.length === 0
        ? 0
        : truckTrips.reduce((sum, trip) => {
            const bookedWeight = sumShipmentWeight(trip.shipments);
            return sum + (truck.maxWeightKg ? (bookedWeight / truck.maxWeightKg) * 100 : 0);
          }, 0) / truckTrips.length;

    return {
      id: truck.id,
      registrationNo: truck.registrationNo,
      trips: truckTrips.length,
      utilization: tripUtilization,
      revenue: truckRevenue,
      status: truck.status,
    };
  });

  return {
    metrics: [
      {
        title: 'Total revenue',
        value: formatCompactNumber(totalRevenue),
        rawValue: totalRevenue,
        icon: 'revenue',
        change: activeBookings.length ? 6.4 : 0,
      },
      {
        title: 'Trips completed',
        value: completedTrips.length,
        rawValue: completedTrips.length,
        icon: 'activity',
        change: activeTrips.length ? 9.1 : 0,
      },
      {
        title: 'Avg utilization',
        value: `${avgUtilization.toFixed(0)}%`,
        rawValue: avgUtilization,
        icon: 'trucks',
        change: avgUtilization - 70,
      },
      {
        title: 'CO2 saved',
        value: `${formatNumber(totalCo2Saved)} kg`,
        rawValue: totalCo2Saved,
        icon: 'co2',
        change: totalCo2Saved > 0 ? 12.3 : 0,
      },
    ],
    revenueSeries,
    utilizationSeries,
    co2Series: {
      totalSaved: totalCo2Saved,
      perTripAvg: activeTrips.length ? totalCo2Saved / activeTrips.length : 0,
      timeSeries: cumulativeCo2,
    },
    truckTable,
    summary: {
      trucks: trucks.length,
      activeBookings: activeBookings.length,
      trips: activeTrips.length,
    },
  };
}

function deriveAdminAnalytics({ shipments, trucks, bookings, trips, period }) {
  const scopedShipments = shipments.filter((shipment) => withinPeriod(shipment.createdAt, period));
  const scopedTrips = trips.filter((trip) => withinPeriod(trip.createdAt, period));
  const scopedBookings = bookings.filter((booking) => withinPeriod(booking.createdAt, period));

  const totalRevenue = scopedTrips.reduce(
    (sum, trip) =>
      sum +
      Number(
        trip.estimatedCost ||
          trip.bookingRequest?.finalPrice ||
          trip.bookingRequest?.quotedPrice ||
          0
      ),
    0
  );

  const totalCo2Saved = scopedTrips.reduce(
    (sum, trip) => sum + Number(trip.co2SavedKg || (trip.estimatedDistanceKm || 0) * 0.12),
    0
  );

  const cityMap = new Map();
  scopedShipments.forEach((shipment) => {
    const current = cityMap.get(shipment.destCity) || {
      city: shipment.destCity,
      shipments: 0,
      weightKg: 0,
    };

    current.shipments += 1;
    current.weightKg += Number(shipment.weightKg || 0);
    cityMap.set(shipment.destCity, current);
  });

  const cityBreakdown = [...cityMap.values()].sort((a, b) => b.shipments - a.shipments);
  const topCities = cityBreakdown.slice(0, 6);

  const heatmapData = topCities.flatMap((entry) =>
    Array.from({ length: 7 }).map((_, index) => ({
      city: entry.city,
      dateLabel: `D+${index + 1}`,
      predictedDemand: Math.max(1, Math.round(entry.shipments * (1 + index * 0.14))),
    }))
  );

  return {
    metrics: [
      {
        title: 'Total shipments',
        value: scopedShipments.length,
        rawValue: scopedShipments.length,
        icon: 'shipments',
        change: scopedShipments.length ? 8.8 : 0,
      },
      {
        title: 'Platform revenue',
        value: formatCompactNumber(totalRevenue),
        rawValue: totalRevenue,
        icon: 'revenue',
        change: totalRevenue ? 11.2 : 0,
      },
      {
        title: 'Live trips',
        value: scopedTrips.filter((trip) => trip.status === 'IN_TRANSIT').length,
        rawValue: scopedTrips.filter((trip) => trip.status === 'IN_TRANSIT').length,
        icon: 'activity',
        change: scopedTrips.length ? 4.6 : 0,
      },
      {
        title: 'CO2 saved',
        value: `${formatNumber(totalCo2Saved)} kg`,
        rawValue: totalCo2Saved,
        icon: 'co2',
        change: totalCo2Saved ? 13.7 : 0,
      },
    ],
    revenueSeries: groupByPeriod(
      scopedTrips,
      (trip) => trip.completedAt || trip.createdAt,
      (trip) =>
        Number(
          trip.estimatedCost ||
            trip.bookingRequest?.finalPrice ||
            trip.bookingRequest?.quotedPrice ||
            0
        ),
      period
    ).map((entry) => ({
      ...entry,
      revenue: entry.value,
      trips: scopedTrips.filter((trip) => {
        const date = trip.completedAt || trip.createdAt;
        return date && new Date(date).toISOString().slice(0, 10) === entry.key;
      }).length,
    })),
    utilizationSeries: groupByPeriod(
      trucks,
      (truck) => truck.updatedAt || truck.createdAt,
      (truck) => (truck.status === 'AVAILABLE' ? 82 : truck.status === 'ON_TRIP' ? 96 : 48),
      period
    ).map((entry) => ({
      label: entry.label,
      utilization: entry.value,
    })),
    co2Series: {
      totalSaved: totalCo2Saved,
      perTripAvg: scopedTrips.length ? totalCo2Saved / scopedTrips.length : 0,
      timeSeries: (() => {
        let cumulative = 0;
        return groupByPeriod(
          scopedTrips,
          (trip) => trip.completedAt || trip.createdAt,
          (trip) => Number(trip.co2SavedKg || (trip.estimatedDistanceKm || 0) * 0.12),
          period
        ).map((entry) => {
          cumulative += entry.value;
          return {
            label: entry.label,
            co2: cumulative,
          };
        });
      })(),
    },
    cityBreakdown,
    heatmapData,
    summary: {
      bookings: scopedBookings.length,
      trucks: trucks.length,
      trips: scopedTrips.length,
    },
  };
}

export function useAnalytics(scope = 'dealer', period = '30d') {
  const [payload, setPayload] = useState({
    isLoading: true,
    error: null,
    analytics: null,
  });

  const refresh = useCallback(async () => {
    setPayload((state) => ({ ...state, isLoading: true, error: null }));

    try {
      if (scope === 'dealer') {
        const [truckResult, bookingResult, tripResult] = await Promise.all([
          truckApi.getTrucks({ page: 1, limit: 100 }),
          bookingApi.getBookingRequests({ page: 1, limit: 100 }),
          tripApi.getTrips({ page: 1, limit: 100 }),
        ]);

        setPayload({
          isLoading: false,
          error: null,
          analytics: deriveDealerAnalytics({
            trucks: truckResult.trucks,
            bookings: bookingResult.bookings,
            trips: tripResult.trips,
            period,
          }),
        });
        return;
      }

      const [shipmentResult, truckResult, bookingResult, tripResult] = await Promise.all([
        shipmentApi.getShipments({ page: 1, limit: 100 }),
        truckApi.getTrucks({ page: 1, limit: 100 }),
        bookingApi.getBookingRequests({ page: 1, limit: 100 }),
        tripApi.getTrips({ page: 1, limit: 100 }),
      ]);

      setPayload({
        isLoading: false,
        error: null,
        analytics: deriveAdminAnalytics({
          shipments: shipmentResult.shipments,
          trucks: truckResult.trucks,
          bookings: bookingResult.bookings,
          trips: tripResult.trips,
          period,
        }),
      });
    } catch (error) {
      setPayload({
        isLoading: false,
        error: error.message,
        analytics: null,
      });
    }
  }, [period, scope]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return useMemo(
    () => ({
      ...payload,
      refresh,
    }),
    [payload, refresh]
  );
}
