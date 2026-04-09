const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');
const { buildTripCO2Summary, updateTripCO2 } = require('./co2.service');
const {
  generateCO2ReportPDF,
  generateInvoicePDF,
} = require('../utils/pdfGenerator.utils');

const tripInclude = {
  truck: {
    include: {
      dealer: {
        include: {
          user: true,
        },
      },
    },
  },
  bookingRequest: {
    include: {
      warehouse: {
        include: {
          user: true,
        },
      },
      shipments: {
        include: {
          shipment: true,
        },
      },
    },
  },
  shipments: {
    include: {
      shipment: true,
    },
  },
  stops: {
    orderBy: {
      sequence: 'asc',
    },
  },
};

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

const getTripWithAccess = async (tripId, user) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripInclude,
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  if (user.role === 'ADMIN') {
    return trip;
  }

  if (user.role === 'DEALER') {
    const dealer = await getDealerProfile(user.userId);
    if (trip.dealerId !== dealer.id) {
      throw ApiError.forbidden('You cannot access this trip document');
    }
    return trip;
  }

  if (user.role === 'WAREHOUSE') {
    const warehouse = await getWarehouseProfile(user.userId);
    if (trip.bookingRequest?.warehouseId !== warehouse.id) {
      throw ApiError.forbidden('You cannot access this trip document');
    }
    return trip;
  }

  throw ApiError.forbidden('You cannot access this trip document');
};

const persistGeneratedDocument = async ({
  tripId,
  bookingRequestId,
  type,
  fileName,
  sizeBytes,
}) => {
  await prisma.document.deleteMany({
    where: {
      tripId,
      type,
    },
  });

  return prisma.document.create({
    data: {
      tripId,
      bookingRequestId,
      type,
      fileName,
      objectKey: `generated/${type.toLowerCase()}/${tripId}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes,
    },
  });
};

const buildInvoicePayload = (trip) => {
  const baseAmount =
    trip.actualCost ||
    trip.estimatedCost ||
    trip.bookingRequest?.finalPrice ||
    trip.bookingRequest?.quotedPrice ||
    0;
  const platformFee = Math.max(Math.round(baseAmount * 0.03), 250);
  const shipmentCount = trip.shipments.length || 1;
  const distanceKm = Number(trip.estimatedDistanceKm || trip.routeSummary?.totalDistanceKm || 0);

  return {
    tripId: trip.id,
    bookingId: trip.bookingRequestId || 'N/A',
    truckRegistration: trip.truck.registrationNo,
    dealerName: trip.truck.dealer.companyName,
    warehouseName: trip.bookingRequest?.warehouse?.warehouseName || 'N/A',
    status: trip.status,
    subtotal: baseAmount,
    platformFee,
    total: baseAmount + platformFee,
    lineItems: [
      {
        label: 'Trip transport charge',
        description: `${shipmentCount} shipment(s) consolidated for this trip`,
        quantityLabel: `${distanceKm.toFixed(1)} km route`,
        amount: baseAmount,
      },
      {
        label: 'Platform operations fee',
        description: 'Routing, booking orchestration, and digital trip supervision',
        quantityLabel: 'Flat fee',
        amount: platformFee,
      },
    ],
    stops: trip.stops.map((stop) => ({
      sequence: stop.sequence,
      type: stop.type,
      city: stop.city,
      address: stop.address,
      shipmentTitle:
        trip.shipments.find((entry) => entry.shipmentId === stop.shipmentId)?.shipment?.title ||
        null,
    })),
  };
};

const buildCO2ReportPayload = (trip) => {
  const summary = buildTripCO2Summary(trip);

  return {
    tripId: trip.id,
    truckRegistration: trip.truck.registrationNo,
    dealerName: trip.truck.dealer.companyName,
    warehouseName: trip.bookingRequest?.warehouse?.warehouseName || 'N/A',
    distanceKm: summary.distanceKm,
    weightTons: summary.weightTons,
    tripCo2Kg: summary.emittedKg,
    baselineCo2Kg: summary.baselineKg,
    co2SavedKg: summary.savedKg,
    savedPct: summary.savedPct,
    utilizationPct: summary.utilizationPct,
    equivalents: summary.equivalents,
    shipments: trip.shipments.map((entry) => ({
      title: entry.shipment.title || entry.shipment.referenceNo || entry.shipment.id,
      originCity: entry.shipment.originCity,
      destCity: entry.shipment.destCity,
      weightKg: Number(entry.shipment.weightKg || 0).toFixed(0),
    })),
  };
};

const generateInvoice = async (tripId, user) => {
  const trip = await getTripWithAccess(tripId, user);
  const payload = buildInvoicePayload(trip);
  const buffer = await generateInvoicePDF(payload);
  const fileName = `trucksetu-invoice-${trip.id.slice(0, 8)}.pdf`;

  await persistGeneratedDocument({
    tripId: trip.id,
    bookingRequestId: trip.bookingRequestId,
    type: 'INVOICE',
    fileName,
    sizeBytes: buffer.length,
  });

  return {
    buffer,
    fileName,
  };
};

const generateCO2Report = async (tripId, user) => {
  await updateTripCO2(tripId);
  const trip = await getTripWithAccess(tripId, user);
  const payload = buildCO2ReportPayload(trip);
  const buffer = await generateCO2ReportPDF(payload);
  const fileName = `trucksetu-co2-report-${trip.id.slice(0, 8)}.pdf`;

  await persistGeneratedDocument({
    tripId: trip.id,
    bookingRequestId: trip.bookingRequestId,
    type: 'CO2_REPORT',
    fileName,
    sizeBytes: buffer.length,
  });

  return {
    buffer,
    fileName,
  };
};

module.exports = {
  generateCO2Report,
  generateInvoice,
};
