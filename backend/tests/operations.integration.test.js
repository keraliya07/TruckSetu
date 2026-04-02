const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const { createClient, startTestServer } = require('./helpers/api');

let testServer;
let warehouseClient;
let dealerClient;

before(async () => {
  testServer = await startTestServer();
  warehouseClient = createClient(testServer.baseUrl);
  dealerClient = createClient(testServer.baseUrl);

  const warehouseLogin = await warehouseClient.login(
    'warehouse@stlos.dev',
    'Warehouse123'
  );
  const dealerLogin = await dealerClient.login('dealer@stlos.dev', 'Dealer123');

  assert.equal(warehouseLogin.response.status, 200);
  assert.equal(dealerLogin.response.status, 200);
});

after(async () => {
  await testServer.close();
});

test('warehouse and dealer logistics flow supports shipment, truck, booking, and trip lifecycle', async () => {
  const stamp = Date.now();
  const truckRegistration = `TST${String(stamp).slice(-10)}`;

  const createTruck = await dealerClient.request('/trucks', {
    method: 'POST',
    body: {
      registrationNo: truckRegistration,
      truckType: 'Integration Truck',
      maxWeightKg: 18000,
      maxVolumeM3: 72,
      emissionFactor: 2.7,
      fuelEfficiency: 4.2,
      currentCity: 'Ahmedabad',
      currentLat: 23.0225,
      currentLng: 72.5714,
    },
  });

  assert.equal(createTruck.response.status, 201);
  const truckId = createTruck.body.id;
  assert.equal(createTruck.body.registrationNo, truckRegistration);

  const createShipment = await warehouseClient.request('/shipments', {
    method: 'POST',
    body: {
      title: `Integration Shipment ${stamp}`,
      description: 'Phase 2 integration test shipment',
      weightKg: 2400,
      volumeM3: 12,
      destCity: 'Vadodara',
      destAddress: 'Makarpura GIDC, Vadodara',
      destLat: 22.3072,
      destLng: 73.1812,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      fragile: false,
      hazardous: false,
      priority: 3,
      specialInstructions: 'Integration flow check',
    },
  });

  assert.equal(createShipment.response.status, 201);
  const shipmentId = createShipment.body.id;
  assert.equal(createShipment.body.status, 'DRAFT');

  const updateShipment = await warehouseClient.request(`/shipments/${shipmentId}`, {
    method: 'PUT',
    body: {
      title: `Integration Shipment ${stamp} Updated`,
      weightKg: 2500,
    },
  });

  assert.equal(updateShipment.response.status, 200);
  assert.equal(updateShipment.body.title, `Integration Shipment ${stamp} Updated`);

  const markPending = await warehouseClient.request('/shipments/batch-status', {
    method: 'PATCH',
    body: {
      shipmentIds: [shipmentId],
      status: 'PENDING',
    },
  });

  assert.equal(markPending.response.status, 200);
  assert.equal(markPending.body.count, 1);
  assert.equal(markPending.body.shipments[0].status, 'PENDING');

  const createBooking = await warehouseClient.request('/bookings', {
    method: 'POST',
    body: {
      shipmentIds: [shipmentId],
      truckId,
      quotedPrice: 18500,
    },
  });

  assert.equal(createBooking.response.status, 201);
  const bookingId = createBooking.body.id;
  assert.equal(createBooking.body.status, 'SENT');

  const approveBooking = await dealerClient.request(`/bookings/${bookingId}/respond`, {
    method: 'PATCH',
    body: {
      action: 'APPROVE',
      dealerNote: 'Approved during backend integration test',
    },
  });

  assert.equal(approveBooking.response.status, 200);
  assert.equal(approveBooking.body.status, 'APPROVED');
  assert.ok(approveBooking.body.trip);
  const tripId = approveBooking.body.trip.id;

  const tripsList = await dealerClient.request('/trips');
  assert.equal(tripsList.response.status, 200);
  assert.equal(tripsList.body.trips.some((trip) => trip.id === tripId), true);

  const startTrip = await dealerClient.request(`/trips/${tripId}/start`, {
    method: 'PATCH',
  });
  assert.equal(startTrip.response.status, 200);
  assert.equal(startTrip.body.status, 'IN_TRANSIT');

  const stopIds = startTrip.body.stops.map((stop) => stop.id);

  for (const stopId of stopIds) {
    const completeStop = await dealerClient.request(
      `/trips/${tripId}/stops/${stopId}/complete`,
      {
        method: 'PATCH',
      }
    );

    assert.equal(completeStop.response.status, 200);
  }

  const finalTrip = await dealerClient.request(`/trips/${tripId}`);
  assert.equal(finalTrip.response.status, 200);
  assert.equal(finalTrip.body.status, 'DELIVERED');

  const finalTruck = await dealerClient.request(`/trucks/${truckId}`);
  assert.equal(finalTruck.response.status, 200);
  assert.equal(finalTruck.body.status, 'AVAILABLE');

  const finalShipment = await warehouseClient.request(`/shipments/${shipmentId}`);
  assert.equal(finalShipment.response.status, 200);
  assert.equal(finalShipment.body.status, 'DELIVERED');
});
