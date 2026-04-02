const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const { createClient, startTestServer } = require('./helpers/api');

let testServer;
let warehouseClient;

before(async () => {
  testServer = await startTestServer();
  warehouseClient = createClient(testServer.baseUrl);

  const warehouseLogin = await warehouseClient.login(
    'warehouse@stlos.dev',
    'Warehouse123'
  );

  assert.equal(warehouseLogin.response.status, 200);
});

after(async () => {
  await testServer.close();
});

test('warehouse can score trucks, read cached optimization results, and get a fit estimate', async () => {
  const stamp = Date.now();

  const createShipment = await warehouseClient.request('/shipments', {
    method: 'POST',
    body: {
      title: `Optimization Shipment ${stamp}`,
      description: 'Phase 3 optimization test shipment',
      weightKg: 1800,
      volumeM3: 10,
      destCity: 'Surat',
      destAddress: 'Hazira Road, Surat',
      destLat: 21.1702,
      destLng: 72.8311,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      fragile: false,
      hazardous: false,
      priority: 2,
      specialInstructions: 'Optimization integration check',
    },
  });

  assert.equal(createShipment.response.status, 201);
  const shipmentId = createShipment.body.id;

  const markPending = await warehouseClient.request('/shipments/batch-status', {
    method: 'PATCH',
    body: {
      shipmentIds: [shipmentId],
      status: 'PENDING',
    },
  });

  assert.equal(markPending.response.status, 200);

  const score = await warehouseClient.request('/optimization/score', {
    method: 'POST',
    body: {
      shipmentIds: [shipmentId],
    },
  });

  assert.equal(score.response.status, 200);
  assert.ok(score.body.cacheKey);
  assert.ok(Array.isArray(score.body.trucks));
  assert.ok(score.body.trucks.length >= 1);
  assert.ok(score.body.trucks[0].scores.composite > 0);
  assert.ok(score.body.trucks[0].route.stops.length >= 2);

  const cached = await warehouseClient.request(
    `/optimization/result/${score.body.cacheKey}`
  );

  assert.equal(cached.response.status, 200);
  assert.equal(cached.body.cacheKey, score.body.cacheKey);
  assert.equal(cached.body.trucks.length, score.body.trucks.length);

  const history = await warehouseClient.request('/optimization/history?limit=5');

  assert.equal(history.response.status, 200);
  assert.ok(Array.isArray(history.body.runs));
  assert.equal(
    history.body.runs.some((run) => run.cacheKey === score.body.cacheKey),
    true
  );

  const fitEstimate = await warehouseClient.request('/optimization/truck-fit', {
    method: 'POST',
    body: {
      weightKg: 1800,
      volumeM3: 10,
      originCity: 'Ahmedabad',
      destCity: 'Surat',
    },
  });

  assert.equal(fitEstimate.response.status, 200);
  assert.ok(fitEstimate.body.recommendedType);
  assert.ok(fitEstimate.body.estimatedCost > 0);
  assert.ok(fitEstimate.body.estimatedCO2Kg > 0);
});
