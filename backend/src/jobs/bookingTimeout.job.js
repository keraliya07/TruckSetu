const cron = require('node-cron');

const prisma = require('../config/db');
const { BOOKING_TIMEOUT_CRON } = require('../config/env');
const notificationService = require('../services/notification.service');

let bookingTimeoutTask = null;

async function processExpiredBookings(options = {}) {
  const prismaClient = options.prismaClient || prisma;
  const notifier = options.notifier || notificationService;
  const now = options.now || new Date();

  const expiredBookings = await prismaClient.bookingRequest.findMany({
    where: {
      status: 'SENT',
      expiresAt: {
        lt: now,
      },
    },
    include: {
      truck: {
        include: {
          dealer: {
            include: {
              user: true,
            },
          },
        },
      },
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
  });

  for (const booking of expiredBookings) {
    await prismaClient.$transaction(async (tx) => {
      await tx.bookingRequest.update({
        where: { id: booking.id },
        data: {
          status: 'EXPIRED',
          respondedAt: now,
        },
      });

      for (const entry of booking.shipments) {
        const approvedCount = await tx.bookingRequest.count({
          where: {
            status: 'APPROVED',
            shipments: {
              some: {
                shipmentId: entry.shipmentId,
              },
            },
          },
        });

        if (approvedCount > 0) {
          continue;
        }

        const openInviteCount = await tx.bookingRequest.count({
          where: {
            status: 'SENT',
            shipments: {
              some: {
                shipmentId: entry.shipmentId,
              },
            },
          },
        });

        await tx.shipment.update({
          where: { id: entry.shipmentId },
          data: {
            status: openInviteCount > 0 ? 'BOOKING_PENDING' : 'PENDING',
          },
        });
      }
    });

    await notifier.sendNotification({
      userId: booking.requestedById || booking.warehouse.user?.id,
      type: 'BOOKING',
      title: 'Booking request expired',
      message: `Shipment request ${booking.id.slice(0, 8)} expired without a dealer response.`,
      link: '/warehouse/bookings',
      metadata: {
        bookingId: booking.id,
      },
      email: {
        subject: 'TruckSetu shipment request expired',
        text: `Shipment request ${booking.id.slice(0, 8)} expired without a response.`,
      },
    });

    await notifier.sendNotification({
      userId: booking.truck.dealer.user?.id,
      type: 'BOOKING',
      title: 'Shipment request closed',
      message: `Shipment request ${booking.id.slice(0, 8)} was marked expired after the response window elapsed.`,
      link: `/dealer/bookings/${booking.id}`,
      metadata: {
        bookingId: booking.id,
      },
    });
  }

  return {
    expiredCount: expiredBookings.length,
  };
}

function startBookingTimeoutJob() {
  if (bookingTimeoutTask) {
    return bookingTimeoutTask;
  }

  bookingTimeoutTask = cron.schedule(BOOKING_TIMEOUT_CRON, () => {
    processExpiredBookings().catch((error) => {
      console.warn(`[booking-timeout-job] ${error.message}`);
    });
  });

  return bookingTimeoutTask;
}

function stopBookingTimeoutJob() {
  bookingTimeoutTask?.stop();
  bookingTimeoutTask = null;
}

module.exports = {
  processExpiredBookings,
  startBookingTimeoutJob,
  stopBookingTimeoutJob,
};
