const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');

const {
  forecastDemand,
  getDistanceMatrix,
  MlServiceError,
  predictPrice,
  scoreReturnLoads,
  scoreCO2,
  scoreTrucks,
  solveRoute,
} = require('../src/services/ml.service');

let server;
let baseURL;

before(async () => {
  server = http.createServer(async (request, response) => {
    const chunks = [];

    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};

    response.setHeader('Content-Type', 'application/json');

    if (request.url === '/internal/score-trucks') {
      response.end(
        JSON.stringify({
          scoredTrucks: [
            {
              truckId: body.trucks[0]?.id || 'truck-1',
              scores: {
                utilization: 84.4,
                route: 78.2,
                cost: 72.1,
                co2: 81.5,
              },
              compositeScore: 79.3,
              estimatedCost: 14500,
              co2SavedKg: 32.6,
            },
          ],
        })
      );
      return;
    }

    if (request.url === '/internal/vrp-route') {
      response.end(
        JSON.stringify({
          orderedStops: [
            {
              type: 'PICKUP',
              city: 'Ahmedabad',
              address: 'Warehouse dock',
              lat: 23.0225,
              lng: 72.5714,
              shipmentId: null,
            },
            {
              type: 'DELIVERY',
              city: 'Surat',
              address: 'Textile market',
              lat: 21.1702,
              lng: 72.8311,
              shipmentId: 'shipment-1',
            },
          ],
          totalDistanceKm: 276.4,
          totalTimeS: 22800,
          feasible: true,
          geometry: {
            type: 'LineString',
            coordinates: [
              [72.5714, 23.0225],
              [72.8311, 21.1702],
            ],
          },
        })
      );
      return;
    }

    if (request.url === '/internal/return-load-score') {
      response.end(
        JSON.stringify({
          scored: [
            {
              shipmentId: body.candidateShipments[0]?.id || 'shipment-1',
              pickupDistanceKm: 18.4,
              proximityScore: 87.2,
              directionScore: 76.3,
              utilizationScore: 66.8,
              combinedScore: 78.1,
            },
          ],
        })
      );
      return;
    }

    if (request.url === '/internal/forecast-demand') {
      response.end(
        JSON.stringify({
          forecasts: [
            {
              city: body.cities[0] || 'Ahmedabad',
              date: '2026-04-04',
              predicted_demand: 18.6,
              lower_bound: 16.1,
              upper_bound: 21.4,
            },
          ],
        })
      );
      return;
    }

    if (request.url === '/internal/predict-price') {
      response.end(
        JSON.stringify({
          estimated_price: 22450,
          confidence_interval: [20950, 23990],
          pricing_factors: {
            truck_factor: 1.12,
            lane_factor: 1.04,
            urgency_factor: 1,
          },
        })
      );
      return;
    }

    if (request.url === '/internal/distance-matrix') {
      response.end(
        JSON.stringify({
          distances: [
            [0, 268400],
            [268400, 0],
          ],
          durations: [
            [0, 21600],
            [21600, 0],
          ],
          source: 'osrm',
        })
      );
      return;
    }

    if (request.url === '/internal/co2-score') {
      response.end(
        JSON.stringify({
          emitted_kg: 134.6,
          baseline_kg: 164.2,
          saved_kg: 29.6,
          saved_pct: 18.03,
          equivalents: {
            trees_equivalent: 1.36,
          },
        })
      );
      return;
    }

    if (request.url === '/internal/return-load-score-invalid') {
      response.end(
        JSON.stringify({
          scored: [
            {
              shipmentId: 'shipment-1',
              pickupDistanceKm: 'bad-data',
            },
          ],
        })
      );
      return;
    }

    response.statusCode = 404;
    response.end(JSON.stringify({ message: 'Not found' }));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseURL = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    })
  );
});

test('backend ML gateway validates scoring, routing, and return-load responses', async () => {
  const scoredTrucks = await scoreTrucks(
    {
      trucks: [{ id: 'truck-1' }],
      shipments: [{ id: 'shipment-1' }],
    },
    { baseURL }
  );

  assert.equal(scoredTrucks.length, 1);
  assert.equal(scoredTrucks[0].truckId, 'truck-1');
  assert.equal(scoredTrucks[0].scores.co2, 81.5);

  const route = await solveRoute(
    {
      truck: { id: 'truck-1' },
      shipments: [{ id: 'shipment-1', originCity: 'Ahmedabad', destCity: 'Surat' }],
    },
    { baseURL }
  );

  assert.equal(route.feasible, true);
  assert.equal(route.orderedStops.length, 2);
  assert.equal(route.geometry.type, 'LineString');

  const matches = await scoreReturnLoads(
    {
      truck: { id: 'truck-1', maxWeightKg: 12000, maxVolumeM3: 40 },
      candidateShipments: [{ id: 'shipment-1' }],
    },
    { baseURL }
  );

  assert.equal(matches.length, 1);
  assert.equal(matches[0].combinedScore, 78.1);

  const forecasts = await forecastDemand(
    {
      cities: ['Ahmedabad'],
      horizon_days: 7,
    },
    { baseURL }
  );

  assert.equal(forecasts.length, 1);
  assert.equal(forecasts[0].city, 'Ahmedabad');

  const price = await predictPrice(
    {
      distance_km: 268.4,
      weight_tons: 5.2,
      truck_type: 'HEAVY',
      origin_city: 'Ahmedabad',
      dest_city: 'Surat',
      urgency: 1,
    },
    { baseURL }
  );

  assert.equal(price.estimated_price, 22450);
  assert.equal(price.confidence_interval.length, 2);

  const matrix = await getDistanceMatrix(
    {
      coordinates: [
        { lat: 23.0225, lng: 72.5714 },
        { lat: 21.1702, lng: 72.8311 },
      ],
    },
    { baseURL }
  );

  assert.equal(matrix.source, 'osrm');
  assert.equal(matrix.distances[0][1], 268400);

  const co2 = await scoreCO2(
    {
      distance_km: 268.4,
      weight_tons: 5.2,
      fuel_efficiency: 3.8,
      emission_factor: 2.68,
    },
    { baseURL }
  );

  assert.equal(co2.saved_kg, 29.6);
});

test('backend ML gateway raises a typed error when the ML response contract is invalid', async () => {
  const invalidClient = {
    post: async () => ({
      data: {
        scored: [
          {
            shipmentId: 'shipment-1',
            pickupDistanceKm: 'bad-data',
          },
        ],
      },
    }),
  };

  await assert.rejects(
    () =>
      scoreReturnLoads(
        {
          truck: { id: 'truck-1', maxWeightKg: 12000, maxVolumeM3: 40 },
          candidateShipments: [{ id: 'shipment-1' }],
        },
        { client: invalidClient }
      ),
    (error) => {
      assert.equal(error instanceof MlServiceError, true);
      assert.match(error.message, /response validation failed/i);
      return true;
    }
  );
});
