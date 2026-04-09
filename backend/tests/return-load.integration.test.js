const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const prisma = require('../src/config/db');
const { createClient, startTestServer } = require('./helpers/api');

let testServer;
let warehouseClient;
let dealerClient;

const createPendingShipment = async (
  stamp,
  suffix,
  originCity,
  originLat,
  originLng,
  destCity,
  destLat,
  destLng
) => {
  const created = await warehouseClient.request('/shipments', {
    method: 'POST',
    body: {
      title: `Return Load Shipment ${suffix} ${stamp}`,
      description: 'Phase 5 return load integration test',
      weightKg: 1800,
      volumeM3: 9,
      autoDispatch: false,
      destCity,
      destAddress: `${destCity} logistics hub`,
      destLat,
      destLng,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      fragile: false,
      hazardous: false,
      priority: 2,
      specialInstructions: 'Return load candidate',
    },
  });

  assert.equal(created.response.status, 201);

  await prisma.shipment.update({
    where: { id: created.body.id },
    data: {
      originCity,
      originAddress: `${originCity} pickup point`,
      originLat,
      originLng,
    },
  });

  const updated = await prismaStatus(created.body.id);
  return updated;
};

const prismaStatus = async (shipmentId) => {
  const result = await warehouseClient.request('/shipments/batch-status', {
    method: 'PATCH',
    body: {
      shipmentIds: [shipmentId],
      status: 'PENDING',
    },
  });

  assert.equal(result.response.status, 200);
  return result.body.shipments[0];
};

before(async () => {
  testServer = await startTestServer();
  warehouseClient = createClient(testServer.baseUrl);
  dealerClient = createClient(testServer.baseUrl);

  const warehouseLogin = await warehouseClient.login(
  'warehouse@trucksetu.dev',
    'Warehouse123'
  );
  const dealerLogin = await dealerClient.login('dealer@trucksetu.dev', 'Dealer123');

  assert.equal(warehouseLogin.response.status, 200);
  assert.equal(dealerLogin.response.status, 200);
});

after(async () => {
  await testServer.close();
});

test('dealer can review, reject, and accept return load matches after trip delivery', async () => {
  const stamp = Date.now();
  const truckRegistration = `RTL${String(stamp).slice(-10)}`;

  const createTruck = await dealerClient.request('/trucks', {
    method: 'POST',
    body: {
      registrationNo: truckRegistration,
      truckType: 'Return Load Truck',
      maxWeightKg: 17000,
      maxVolumeM3: 70,
      emissionFactor: 2.6,
      fuelEfficiency: 4.5,
      currentCity: 'Ahmedabad',
      currentLat: 23.0225,
      currentLng: 72.5714,
    },
  });

  assert.equal(createTruck.response.status, 201);

  const outboundShipment = await warehouseClient.request('/shipments', {
    method: 'POST',
    body: {
      title: `Outbound Shipment ${stamp}`,
      description: 'Outbound trip for return load matching',
      weightKg: 2500,
      volumeM3: 10,
      autoDispatch: false,
      destCity: 'Surat',
      destAddress: 'Adajan, Surat',
      destLat: 21.1702,
      destLng: 72.8311,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      fragile: false,
      hazardous: false,
      priority: 3,
      specialInstructions: 'Outbound leg',
    },
  });

  assert.equal(outboundShipment.response.status, 201);
  await prismaStatus(outboundShipment.body.id);

  const candidateOne = await createPendingShipment(
    stamp,
    'A',
    'Surat',
    21.1702,
    72.8311,
    'Ahmedabad',
    23.0225,
    72.5714
  );
  const candidateTwo = await createPendingShipment(
    stamp,
    'B',
    'Surat',
    21.1945,
    72.7822,
    'Vadodara',
    22.3072,
    73.1812
  );

  const booking = await warehouseClient.request('/bookings', {
    method: 'POST',
    body: {
      shipmentIds: [outboundShipment.body.id],
      truckId: createTruck.body.id,
      quotedPrice: 19250,
    },
  });

  assert.equal(booking.response.status, 201);

  const approved = await dealerClient.request(`/bookings/${booking.body.id}/respond`, {
    method: 'PATCH',
    body: {
      action: 'APPROVE',
      dealerNote: 'Approving outbound leg for return-load test',
    },
  });

  assert.equal(approved.response.status, 200);
  const tripId = approved.body.trip.id;

  const started = await dealerClient.request(`/trips/${tripId}/start`, {
    method: 'PATCH',
  });

  assert.equal(started.response.status, 200);

  for (const stop of started.body.stops) {
    const complete = await dealerClient.request(
      `/trips/${tripId}/stops/${stop.id}/complete`,
      { method: 'PATCH' }
    );
    assert.equal(complete.response.status, 200);
  }

  const matches = await dealerClient.request(`/return-loads?tripId=${tripId}`);
  assert.equal(matches.response.status, 200);
  assert.ok(matches.body.matches.length >= 2);

  const firstMatch = matches.body.matches.find(
    (match) => match.shipmentId === candidateOne.id
  );
  const secondMatch = matches.body.matches.find(
    (match) => match.shipmentId === candidateTwo.id
  );

  assert.ok(firstMatch);
  assert.ok(secondMatch);

  const rejected = await dealerClient.request(`/return-loads/${firstMatch.id}/reject`, {
    method: 'POST',
  });
  assert.equal(rejected.response.status, 200);
  assert.equal(rejected.body.match.status, 'REJECTED');

  const accepted = await dealerClient.request(`/return-loads/${secondMatch.id}/accept`, {
    method: 'POST',
  });
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.body.bookingRequest.status, 'PRE_APPROVED');
  assert.equal(accepted.body.newTrip.status, 'PLANNED');

  const refreshedMatches = await dealerClient.request(`/return-loads?tripId=${tripId}`);
  assert.equal(refreshedMatches.response.status, 200);

  const acceptedMatch = refreshedMatches.body.matches.find(
    (match) => match.id === secondMatch.id
  );
  const rejectedMatch = refreshedMatches.body.matches.find(
    (match) => match.id === firstMatch.id
  );

  assert.equal(acceptedMatch.status, 'ACCEPTED');
  assert.equal(rejectedMatch.status, 'REJECTED');
});
