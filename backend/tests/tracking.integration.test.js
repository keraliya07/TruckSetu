const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const { createClient, startTestServer } = require('./helpers/api');

let testServer;
let warehouseClient;
let dealerClient;

async function provisionTrip() {
  const stamp = Date.now();
  const truckRegistration = `TRK${String(stamp).slice(-10)}`;

  const createTruck = await dealerClient.request('/trucks', {
    method: 'POST',
    body: {
      registrationNo: truckRegistration,
      truckType: 'Realtime Test Truck',
      maxWeightKg: 16000,
      maxVolumeM3: 65,
      emissionFactor: 2.5,
      fuelEfficiency: 4.8,
      currentCity: 'Ahmedabad',
      currentLat: 23.0225,
      currentLng: 72.5714,
    },
  });

  assert.equal(createTruck.response.status, 201);

  const createShipment = await warehouseClient.request('/shipments', {
    method: 'POST',
    body: {
      title: `Realtime Shipment ${stamp}`,
      description: 'Phase 4 tracking integration test',
      weightKg: 2200,
      volumeM3: 10,
      destCity: 'Surat',
      destAddress: 'Adajan, Surat',
      destLat: 21.1702,
      destLng: 72.8311,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      fragile: false,
      hazardous: false,
      priority: 2,
      specialInstructions: 'Realtime validation',
    },
  });

  assert.equal(createShipment.response.status, 201);
  const shipmentId = createShipment.body.id;
  assert.equal(createShipment.body.status, 'BOOKING_PENDING');

  const dealerBookings = await dealerClient.request('/bookings?status=SENT&limit=50');
  assert.equal(dealerBookings.response.status, 200);

  const autoBooking = dealerBookings.body.bookings.find((booking) =>
    booking.shipments.some((entry) => entry.shipment.id === shipmentId)
  );

  assert.ok(autoBooking);

  const approveBooking = await dealerClient.request(`/bookings/${autoBooking.id}/respond`, {
    method: 'PATCH',
    body: {
      action: 'APPROVE',
      dealerNote: 'Tracking test approval',
    },
  });

  assert.equal(approveBooking.response.status, 200);
  assert.ok(approveBooking.body.trip);

  return {
    tripId: approveBooking.body.trip.id,
    shipmentId,
  };
}

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

test('tracking endpoints record live location history and delivery notifications', async () => {
  const { tripId } = await provisionTrip();

  const startTrip = await dealerClient.request(`/trips/${tripId}/start`, {
    method: 'PATCH',
  });

  assert.equal(startTrip.response.status, 200);
  assert.equal(startTrip.body.status, 'IN_TRANSIT');

  const updateOne = await dealerClient.request(`/tracking/${tripId}/location`, {
    method: 'POST',
    body: {
      lat: 22.5121,
      lng: 72.9254,
      speed: 48,
      heading: 145,
      source: 'API_TEST',
      recordedAt: new Date().toISOString(),
    },
  });

  assert.equal(updateOne.response.status, 201);
  assert.equal(updateOne.body.tripId, tripId);

  const updateTwo = await dealerClient.request(`/tracking/${tripId}/location`, {
    method: 'POST',
    body: {
      lat: 21.7401,
      lng: 72.1534,
      speed: 54,
      heading: 164,
      source: 'API_TEST',
      recordedAt: new Date(Date.now() + 1000).toISOString(),
    },
  });

  assert.equal(updateTwo.response.status, 201);

  const latest = await warehouseClient.request(`/tracking/${tripId}/latest`);
  assert.equal(latest.response.status, 200);
  assert.equal(latest.body.latestLocation.source, 'API_TEST');
  assert.equal(latest.body.truckPosition.lat, 21.7401);

  const history = await warehouseClient.request(`/tracking/${tripId}/history?limit=5`);
  assert.equal(history.response.status, 200);
  assert.ok(history.body.locations.length >= 2);
  assert.equal(history.body.locations[0].lat, 21.7401);

  for (const stop of startTrip.body.stops) {
    const completeStop = await dealerClient.request(
      `/trips/${tripId}/stops/${stop.id}/complete`,
      {
        method: 'PATCH',
      }
    );

    assert.equal(completeStop.response.status, 200);
  }

  const notifications = await warehouseClient.request('/notifications?limit=10');
  assert.equal(notifications.response.status, 200);
  assert.ok(notifications.body.unreadCount >= 1);

  const deliveryNotification = notifications.body.notifications.find(
    (notification) =>
      notification.type === 'TRIP' &&
      notification.metadata?.tripId === tripId
  );

  assert.ok(deliveryNotification);

  const markRead = await warehouseClient.request(
    `/notifications/${deliveryNotification.id}/read`,
    {
      method: 'PATCH',
    }
  );

  assert.equal(markRead.response.status, 200);
  assert.equal(markRead.body.notification.isRead, true);

  const markAllRead = await warehouseClient.request('/notifications/read-all', {
    method: 'POST',
  });

  assert.equal(markAllRead.response.status, 200);
});
