const assert = require('node:assert/strict');
const { test } = require('node:test');

const { processExpiredBookings } = require('../src/jobs/bookingTimeout.job');
const { buildWaypointStream } = require('../src/jobs/gpsSimulator.job');
const { triggerMLRetrain } = require('../src/jobs/mlRetrain.job');

test('gps simulator builds waypoints from route geometry first', () => {
  const waypoints = buildWaypointStream({
    routeGeometry: {
      coordinates: [
        [72.5714, 23.0225],
        [72.8311, 21.1702],
      ],
    },
    stops: [
      { lat: 23.1, lng: 72.5 },
    ],
  });

  assert.equal(waypoints.length, 2);
  assert.equal(waypoints[0].lat, 23.0225);
  assert.equal(waypoints[1].lng, 72.8311);
});

test('booking timeout job expires stale bookings and notifies both sides', async () => {
  const sentNotifications = [];
  const updatedBookings = [];
  const updatedShipments = [];
  const bookingCounts = [];

  const prismaClient = {
    bookingRequest: {
      findMany: async () => [
        {
          id: 'booking-1',
          requestedById: 'warehouse-user',
          truck: {
            dealer: {
              user: { id: 'dealer-user' },
            },
          },
          warehouse: {
            user: { id: 'warehouse-user' },
          },
          shipments: [
            { shipmentId: 'shipment-1' },
            { shipmentId: 'shipment-2' },
          ],
        },
      ],
    },
    $transaction: async (callback) =>
      callback({
        bookingRequest: {
          update: async ({ where, data }) => {
            updatedBookings.push({ where, data });
          },
          count: async (query) => {
            bookingCounts.push(query);

            if (query.where.status === 'APPROVED') {
              return 0;
            }

            return 0;
          },
        },
        shipment: {
          update: async ({ where, data }) => {
            updatedShipments.push({ where, data });
          },
        },
      }),
  };

  const notifier = {
    sendNotification: async (payload) => {
      sentNotifications.push(payload);
    },
  };

  const result = await processExpiredBookings({
    prismaClient,
    notifier,
    now: new Date(),
  });

  assert.equal(result.expiredCount, 1);
  assert.equal(updatedBookings.length, 1);
  assert.equal(updatedShipments.length, 2);
  assert.equal(bookingCounts.length, 4);
  assert.equal(sentNotifications.length, 2);
  assert.equal(sentNotifications[0].type, 'BOOKING');
});

test('ml retrain job notifies admins when the ml request fails', async () => {
  const notifications = [];

  const outcome = await triggerMLRetrain({
    client: {
      post: async () => {
        throw new Error('ml unavailable');
      },
    },
    prismaClient: {
      user: {
        findMany: async () => [{ id: 'admin-1' }, { id: 'admin-2' }],
      },
    },
    notifier: {
      sendNotification: async (payload) => {
        notifications.push(payload);
      },
    },
  });

  assert.equal(outcome.ok, false);
  assert.equal(notifications.length, 2);
  assert.equal(notifications[0].type, 'ADMIN');
});
