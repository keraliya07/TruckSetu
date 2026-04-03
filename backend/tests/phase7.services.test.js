const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  buildTripCO2Summary,
  calculateCO2,
  getEnvironmentalEquivalents,
} = require('../src/services/co2.service');
const {
  generateCO2ReportPDF,
  generateInvoicePDF,
} = require('../src/utils/pdfGenerator.utils');

test('co2 service calculates emissions, savings, and equivalents', () => {
  const result = calculateCO2({
    distanceKm: 320,
    weightTons: 7.5,
    emissionFactor: 2.68,
    fuelEfficiency: 4.8,
    utilizationPct: 82,
  });

  assert.equal(typeof result.emittedKg, 'number');
  assert.equal(result.baselineKg > result.emittedKg, true);
  assert.equal(result.savedKg > 0, true);
  assert.equal(result.savedPct > 0, true);

  const equivalents = getEnvironmentalEquivalents(result.savedKg);
  assert.equal(equivalents.treesEquivalent > 0, true);
  assert.equal(equivalents.carKmAvoided > 0, true);
});

test('co2 service can summarize a trip payload', () => {
  const summary = buildTripCO2Summary({
    estimatedDistanceKm: 210,
    truck: {
      maxWeightKg: 12000,
      emissionFactor: 2.68,
      fuelEfficiency: 4.5,
    },
    shipments: [
      {
        shipment: {
          weightKg: 3200,
        },
      },
      {
        shipment: {
          weightKg: 1800,
        },
      },
    ],
  });

  assert.equal(summary.distanceKm, 210);
  assert.equal(summary.weightTons, 5);
  assert.equal(summary.utilizationPct > 0, true);
  assert.equal(summary.equivalents.treesEquivalent > 0, true);
});

test('pdf generator creates invoice and co2 report buffers', async () => {
  const invoiceBuffer = await generateInvoicePDF({
    tripId: 'trip-12345678',
    bookingId: 'booking-1234',
    truckRegistration: 'GJ01AB1234',
    dealerName: 'Freight Dealer Pvt Ltd',
    warehouseName: 'Main Warehouse',
    status: 'DELIVERED',
    subtotal: 18500,
    platformFee: 555,
    total: 19055,
    lineItems: [
      {
        label: 'Trip transport charge',
        description: 'Single lane delivery',
        quantityLabel: '180.0 km route',
        amount: 18500,
      },
    ],
    stops: [
      {
        sequence: 1,
        type: 'PICKUP',
        city: 'Ahmedabad',
        address: 'Warehouse dock',
        shipmentTitle: 'Electronics consignment',
      },
    ],
  });

  const co2Buffer = await generateCO2ReportPDF({
    tripId: 'trip-12345678',
    truckRegistration: 'GJ01AB1234',
    dealerName: 'Freight Dealer Pvt Ltd',
    warehouseName: 'Main Warehouse',
    distanceKm: 180,
    weightTons: 5.2,
    tripCo2Kg: 96.2,
    baselineCo2Kg: 117.4,
    co2SavedKg: 21.2,
    savedPct: 18.06,
    utilizationPct: 78,
    equivalents: {
      treesEquivalent: 0.97,
      carKmAvoided: 86.9,
      flightsAvoided: 0.083,
    },
    shipments: [
      {
        title: 'Electronics consignment',
        originCity: 'Ahmedabad',
        destCity: 'Surat',
        weightKg: '5200',
      },
    ],
  });

  assert.equal(invoiceBuffer instanceof Buffer, true);
  assert.equal(co2Buffer instanceof Buffer, true);
  assert.match(invoiceBuffer.slice(0, 4).toString('utf8'), /%PDF/);
  assert.match(co2Buffer.slice(0, 4).toString('utf8'), /%PDF/);
});
