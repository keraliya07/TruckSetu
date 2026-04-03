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
        },
      });

      await tx.shipment.updateMany({
        where: {
          id: {
            in: booking.shipments.map((entry) => entry.shipmentId),
          },
        },
        data: {
          status: 'PENDING',
        },
      });
    });

    await notifier.sendNotification({
      userId: booking.requestedById || booking.warehouse.user?.id,
      type: 'BOOKING',
      title: 'Booking request expired',
      message: `Booking ${booking.id.slice(0, 8)} expired without dealer response. Re-run optimization or resend to another truck.`,
      link: '/warehouse/optimization',
      metadata: {
        bookingId: booking.id,
      },
      email: {
        subject: 'STLOS booking request expired',
        text: `Booking ${booking.id.slice(0, 8)} expired without a response.`,
      },
    });

    await notifier.sendNotification({
      userId: booking.truck.dealer.user?.id,
      type: 'BOOKING',
      title: 'Booking request closed',
      message: `Booking ${booking.id.slice(0, 8)} was marked expired after the response window elapsed.`,
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
