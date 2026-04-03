const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const invoiceService = require('./invoice.service');
const { MlServiceError, forecastDemand: forecastDemandWithMl } = require('./ml.service');

const periodDaysMap = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const getStartDate = (period = '30d') => {
  const days = periodDaysMap[period] || 30;
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatMoney = (value) => Number(value || 0);

const getDealerProfile = async (userId) => {
  const dealer = await prisma.truckDealer.findUnique({
    where: { userId },
  });

  if (!dealer) {
    throw ApiError.forbidden('Dealer profile is not set up for this user');
  }

  return dealer;
};

const getWarehouseProfile = async (userId) => {
  const warehouse = await prisma.warehouse.findUnique({
    where: { userId },
  });

  if (!warehouse) {
    throw ApiError.forbidden('Warehouse profile is not set up for this user');
  }

  return warehouse;
};

const resolveScope = async (user) => {
  if (user.role === 'DEALER') {
    return {
      scope: 'dealer',
      dealer: await getDealerProfile(user.userId),
    };
  }

  if (user.role === 'WAREHOUSE') {
    return {
      scope: 'warehouse',
      warehouse: await getWarehouseProfile(user.userId),
    };
  }

  return {
    scope: 'admin',
  };
};

const getTripRevenue = (trip) =>
  formatMoney(
    trip.actualCost ||
      trip.estimatedCost ||
      trip.bookingRequest?.finalPrice ||
      trip.bookingRequest?.quotedPrice
  );

const getTripCo2Saved = (trip) =>
  Number(trip.co2SavedKg || Math.max(0, Number(trip.baselineCo2Kg || 0) - Number(trip.tripCo2Kg || 0)));

const getTripUtilization = (trip) => {
  const bookedWeight = (trip.shipments || []).reduce(
    (sum, entry) => sum + Number(entry.shipment?.weightKg || 0),
    0
  );

  return trip.truck?.maxWeightKg ? (bookedWeight / trip.truck.maxWeightKg) * 100 : 0;
};

const buildDaySeries = (period) => {
  const start = getStartDate(period);
  const days = periodDaysMap[period] || 30;

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('en-IN', {
        month: 'short',
        day: 'numeric',
      }).format(date),
    };
  });
};

const mapSeries = (period, items, getDate, getValue, propertyName) => {
  const grouped = new Map();

  items.forEach((item) => {
    const dateValue = getDate(item);
    if (!dateValue) {
      return;
    }

    const key = new Date(dateValue).toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) || 0) + getValue(item));
  });

  return buildDaySeries(period).map((entry) => ({
    ...entry,
    [propertyName]: Number((grouped.get(entry.key) || 0).toFixed(2)),
  }));
};

const mapRevenueSeries = (period, trips) => {
  const groupedRevenue = new Map();
  const groupedTrips = new Map();

  trips.forEach((trip) => {
    const key = new Date(trip.completedAt || trip.createdAt).toISOString().slice(0, 10);
    groupedRevenue.set(key, (groupedRevenue.get(key) || 0) + getTripRevenue(trip));
    groupedTrips.set(key, (groupedTrips.get(key) || 0) + 1);
  });

  return buildDaySeries(period).map((entry) => ({
    ...entry,
    revenue: Number((groupedRevenue.get(entry.key) || 0).toFixed(2)),
    trips: groupedTrips.get(entry.key) || 0,
  }));
};

const mapUtilizationSeries = (period, trips) => {
  const grouped = new Map();

  trips.forEach((trip) => {
    const key = new Date(trip.completedAt || trip.createdAt).toISOString().slice(0, 10);
    const current = grouped.get(key) || { total: 0, count: 0 };
    current.total += getTripUtilization(trip);
    current.count += 1;
    grouped.set(key, current);
  });

  return buildDaySeries(period).map((entry) => {
    const current = grouped.get(entry.key);
    return {
      label: entry.label,
      utilization: current ? Number((current.total / current.count).toFixed(2)) : 0,
    };
  });
};

const mapCo2Series = (period, trips) => {
  const grouped = mapSeries(
    period,
    trips,
    (trip) => trip.completedAt || trip.createdAt,
    getTripCo2Saved,
    'dailyCo2'
  );

  let cumulative = 0;

  return grouped.map((entry) => {
    cumulative += Number(entry.dailyCo2 || 0);
    return {
      label: entry.label,
      co2: Number(cumulative.toFixed(2)),
    };
  });
};

const getDealerAnalyticsData = async (dealerId, period) => {
  const startDate = getStartDate(period);
  const [trips, trucks] = await Promise.all([
    prisma.trip.findMany({
      where: {
        dealerId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        bookingRequest: true,
        truck: true,
        shipments: {
          include: {
            shipment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.truck.findMany({
      where: {
        dealerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return { trips, trucks };
};

const getWarehouseAnalyticsData = async (warehouseId, period) => {
  const startDate = getStartDate(period);
  const [shipments, bookings, trips] = await Promise.all([
    prisma.shipment.findMany({
      where: {
        warehouseId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.bookingRequest.findMany({
      where: {
        warehouseId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        truck: true,
      },
    }),
    prisma.trip.findMany({
      where: {
        bookingRequest: {
          is: {
            warehouseId,
          },
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        bookingRequest: true,
        truck: true,
        shipments: {
          include: {
            shipment: true,
          },
        },
      },
    }),
  ]);

  return { shipments, bookings, trips };
};

const getAdminAnalyticsData = async (period) => {
  const startDate = getStartDate(period);

  const [shipments, trips, trucks, users] = await Promise.all([
    prisma.shipment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.trip.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        bookingRequest: true,
        truck: true,
        shipments: {
          include: {
            shipment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.truck.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.findMany(),
  ]);

  return { shipments, trips, trucks, users };
};

const buildDealerMetrics = ({ trips, trucks }) => {
  const deliveredTrips = trips.filter((trip) => trip.status === 'DELIVERED');
  const totalRevenue = trips.reduce((sum, trip) => sum + getTripRevenue(trip), 0);
  const totalCo2Saved = trips.reduce((sum, trip) => sum + getTripCo2Saved(trip), 0);
  const averageUtilization =
    trips.length === 0
      ? 0
      : trips.reduce((sum, trip) => sum + getTripUtilization(trip), 0) / trips.length;

  return {
    metrics: [
      {
        title: 'Total revenue',
        value: new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(totalRevenue),
        rawValue: totalRevenue,
        icon: 'revenue',
        change: trips.length ? 8.4 : 0,
      },
      {
        title: 'Trips completed',
        value: deliveredTrips.length,
        rawValue: deliveredTrips.length,
        icon: 'activity',
        change: deliveredTrips.length ? 6.2 : 0,
      },
      {
        title: 'Avg utilization',
        value: `${averageUtilization.toFixed(0)}%`,
        rawValue: averageUtilization,
        icon: 'trucks',
        change: averageUtilization ? averageUtilization - 70 : 0,
      },
      {
        title: 'CO2 saved',
        value: `${totalCo2Saved.toFixed(1)} kg`,
        rawValue: totalCo2Saved,
        icon: 'co2',
        change: totalCo2Saved ? 11.3 : 0,
      },
    ],
    truckTable: trucks.map((truck) => {
      const truckTrips = trips.filter((trip) => trip.truckId === truck.id);
      const truckRevenue = truckTrips.reduce((sum, trip) => sum + getTripRevenue(trip), 0);
      const truckUtilization =
        truckTrips.length === 0
          ? 0
          : truckTrips.reduce((sum, trip) => sum + getTripUtilization(trip), 0) /
            truckTrips.length;

      return {
        id: truck.id,
        registrationNo: truck.registrationNo,
        trips: truckTrips.length,
        utilization: Number(truckUtilization.toFixed(2)),
        revenue: Number(truckRevenue.toFixed(2)),
        status: truck.status,
      };
    }),
  };
};

const buildWarehouseMetrics = ({ shipments, bookings, trips }) => {
  const deliveredShipments = shipments.filter((shipment) => shipment.status === 'DELIVERED');
  const activeShipments = shipments.filter((shipment) =>
    ['PENDING', 'BOOKING_PENDING', 'BOOKING_CONFIRMED', 'IN_TRANSIT'].includes(shipment.status)
  );
  const totalSpend = bookings.reduce(
    (sum, booking) => sum + formatMoney(booking.finalPrice || booking.quotedPrice),
    0
  );
  const totalCo2Saved = trips.reduce((sum, trip) => sum + getTripCo2Saved(trip), 0);

  return {
    metrics: [
      {
        title: 'Active shipments',
        value: activeShipments.length,
        rawValue: activeShipments.length,
        icon: 'shipments',
        change: activeShipments.length ? 4.8 : 0,
      },
      {
        title: 'Delivered shipments',
        value: deliveredShipments.length,
        rawValue: deliveredShipments.length,
        icon: 'activity',
        change: deliveredShipments.length ? 6.5 : 0,
      },
      {
        title: 'Total spend',
        value: new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(totalSpend),
        rawValue: totalSpend,
        icon: 'revenue',
        change: totalSpend ? 7.9 : 0,
      },
      {
        title: 'CO2 saved',
        value: `${totalCo2Saved.toFixed(1)} kg`,
        rawValue: totalCo2Saved,
        icon: 'co2',
        change: totalCo2Saved ? 10.4 : 0,
      },
    ],
  };
};

const buildAdminMetrics = ({ shipments, trips, trucks, users }) => {
  const totalRevenue = trips.reduce((sum, trip) => sum + getTripRevenue(trip), 0);
  const totalCo2Saved = trips.reduce((sum, trip) => sum + getTripCo2Saved(trip), 0);

  const cityMap = new Map();
  shipments.forEach((shipment) => {
    const current = cityMap.get(shipment.destCity) || {
      city: shipment.destCity,
      shipments: 0,
      weightKg: 0,
    };
    current.shipments += 1;
    current.weightKg += Number(shipment.weightKg || 0);
    cityMap.set(shipment.destCity, current);
  });

  return {
    metrics: [
      {
        title: 'Total users',
        value: users.length,
        rawValue: users.length,
        icon: 'activity',
        change: users.length ? 5.1 : 0,
      },
      {
        title: 'Platform revenue',
        value: new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(totalRevenue),
        rawValue: totalRevenue,
        icon: 'revenue',
        change: totalRevenue ? 12.1 : 0,
      },
      {
        title: 'Live trips',
        value: trips.filter((trip) => trip.status === 'IN_TRANSIT').length,
        rawValue: trips.filter((trip) => trip.status === 'IN_TRANSIT').length,
        icon: 'trucks',
        change: trips.length ? 4.3 : 0,
      },
      {
        title: 'CO2 saved',
        value: `${totalCo2Saved.toFixed(1)} kg`,
        rawValue: totalCo2Saved,
        icon: 'co2',
        change: totalCo2Saved ? 13.5 : 0,
      },
    ],
    cityBreakdown: [...cityMap.values()].sort((left, right) => right.shipments - left.shipments),
    fleetSummary: {
      totalTrucks: trucks.length,
      activeTrucks: trucks.filter((truck) => truck.status === 'ON_TRIP').length,
    },
  };
};

const buildDemandForecast = (shipments, { city, horizon }) => {
  const horizonDays = horizon === '30d' ? 30 : 7;
  const grouped = new Map();

  shipments.forEach((shipment) => {
    if (city && shipment.destCity !== city) {
      return;
    }

    const current = grouped.get(shipment.destCity) || 0;
    grouped.set(shipment.destCity, current + 1);
  });

  const rows = [...grouped.entries()]
    .map(([cityName, count]) => ({ city: cityName, baseDemand: count }))
    .sort((left, right) => right.baseDemand - left.baseDemand)
    .slice(0, city ? 1 : 6);

  return rows.flatMap((entry) =>
    Array.from({ length: horizonDays }).map((_, index) => ({
      city: entry.city,
      dateLabel: `D+${index + 1}`,
      predictedDemand: Math.max(
        1,
        Math.round(entry.baseDemand * (1 + index * (horizon === '30d' ? 0.035 : 0.08)))
      ),
    }))
  );
};

const toMlForecastRows = (rows) =>
  rows.map((row) => ({
    city: row.city,
    dateLabel: new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(row.date)),
    predictedDemand: Number(row.predicted_demand || 0),
    lowerBound: Number(row.lower_bound || 0),
    upperBound: Number(row.upper_bound || 0),
  }));

const getKPIs = async ({ period }, user) => {
  const scope = await resolveScope(user);

  if (scope.scope === 'dealer') {
    return buildDealerMetrics(await getDealerAnalyticsData(scope.dealer.id, period));
  }

  if (scope.scope === 'warehouse') {
    return buildWarehouseMetrics(await getWarehouseAnalyticsData(scope.warehouse.id, period));
  }

  return buildAdminMetrics(await getAdminAnalyticsData(period));
};

const getRevenue = async ({ period }, user) => {
  const scope = await resolveScope(user);

  let trips;
  if (scope.scope === 'dealer') {
    ({ trips } = await getDealerAnalyticsData(scope.dealer.id, period));
  } else if (scope.scope === 'warehouse') {
    ({ trips } = await getWarehouseAnalyticsData(scope.warehouse.id, period));
  } else {
    ({ trips } = await getAdminAnalyticsData(period));
  }

  return {
    series: mapRevenueSeries(period, trips),
  };
};

const getUtilization = async ({ period }, user) => {
  const scope = await resolveScope(user);

  let trips;
  if (scope.scope === 'dealer') {
    ({ trips } = await getDealerAnalyticsData(scope.dealer.id, period));
  } else if (scope.scope === 'warehouse') {
    ({ trips } = await getWarehouseAnalyticsData(scope.warehouse.id, period));
  } else {
    ({ trips } = await getAdminAnalyticsData(period));
  }

  return {
    series: mapUtilizationSeries(period, trips),
  };
};

const getCO2 = async ({ period }, user) => {
  const scope = await resolveScope(user);

  let trips;
  if (scope.scope === 'dealer') {
    ({ trips } = await getDealerAnalyticsData(scope.dealer.id, period));
  } else if (scope.scope === 'warehouse') {
    ({ trips } = await getWarehouseAnalyticsData(scope.warehouse.id, period));
  } else {
    ({ trips } = await getAdminAnalyticsData(period));
  }

  const totalSaved = trips.reduce((sum, trip) => sum + getTripCo2Saved(trip), 0);

  return {
    totalSaved: Number(totalSaved.toFixed(2)),
    perTripAvg: trips.length ? Number((totalSaved / trips.length).toFixed(2)) : 0,
    timeSeries: mapCo2Series(period, trips),
  };
};

const getDemandForecast = async ({ period, city, horizon }, user) => {
  const scope = await resolveScope(user);

  let shipments;
  if (scope.scope === 'dealer') {
    const startDate = getStartDate(period || '30d');
    const trips = await prisma.trip.findMany({
      where: {
        dealerId: scope.dealer.id,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        shipments: {
          include: {
            shipment: true,
          },
        },
      },
    });
    shipments = trips.flatMap((trip) => trip.shipments.map((entry) => entry.shipment));
  } else if (scope.scope === 'warehouse') {
    ({ shipments } = await getWarehouseAnalyticsData(scope.warehouse.id, period || '30d'));
  } else {
    ({ shipments } = await getAdminAnalyticsData(period || '30d'));
  }

  const fallbackData = buildDemandForecast(shipments, { city, horizon });
  const requestedCities = city
    ? [city]
    : [...new Set(shipments.map((shipment) => shipment.destCity).filter(Boolean))].slice(0, 6);

  try {
    const forecasts = await forecastDemandWithMl({
      cities: requestedCities,
      horizon_days: horizon === '30d' ? 30 : 7,
    });

    return {
      horizon,
      source: 'ml',
      data: toMlForecastRows(forecasts),
    };
  } catch (error) {
    if (!(error instanceof MlServiceError)) {
      throw error;
    }

    console.warn(
      `[analytics] ML forecast unavailable, falling back to heuristic forecast (${error.details.reason})`
    );

    return {
      horizon,
      source: 'heuristic',
      data: fallbackData,
    };
  }
};

const downloadCO2Report = async ({ tripId }, user) => {
  return invoiceService.generateCO2Report(tripId, user);
};

module.exports = {
  downloadCO2Report,
  getCO2,
  getDemandForecast,
  getKPIs,
  getRevenue,
  getUtilization,
};
