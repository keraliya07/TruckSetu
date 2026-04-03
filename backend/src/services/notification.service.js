const nodemailer = require('nodemailer');

const prisma = require('../config/db');
const {
  NODE_ENV,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} = require('../config/env');
const ApiError = require('../utils/apiError.utils');

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  link: true,
  isRead: true,
  readAt: true,
  metadata: true,
  createdAt: true,
};

let transporter;

const getSocketIO = () => require('../config/socket').getIO?.() || null;

const getTransporter = () => {
  if (NODE_ENV === 'test') {
    return null;
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const mailer = getTransporter();
  if (!mailer || !to) {
    return null;
  }

  return mailer.sendMail({
    from: SMTP_USER,
    to,
    subject,
    html,
  });
};

const sendNotification = async (notification) => {
  const { email, ...notificationData } = notification;
  const created = await prisma.notification.create({
    data: notificationData,
    select: notificationSelect,
  });

  const io = getSocketIO();
  if (io) {
    io.to(`user:${notificationData.userId}`).emit('notification:new', created);
  }

  if (email) {
    const recipient =
      email.to ||
      (
        await prisma.user.findUnique({
          where: { id: notificationData.userId },
          select: { email: true, name: true },
        })
      )?.email;

    if (recipient) {
      try {
        await sendEmail({
          to: recipient,
          subject: email.subject || notificationData.title,
          html:
            email.html ||
            `
              <p>${notificationData.title}</p>
              <p>${notificationData.message}</p>
            `,
        });
      } catch (error) {
        console.warn(
          `[notification] email delivery failed for user ${notificationData.userId}: ${error.message}`
        );
      }
    }
  }

  return created;
};

const getNotifications = async (userId, query = {}) => {
  const limit = Math.min(Number.parseInt(query.limit || '20', 10), 100);

  const [notifications, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: notificationSelect,
    }),
    prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
};

const markRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    select: notificationSelect,
  });

  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification:updated', updated);
  }

  return {
    message: 'Notification marked as read',
    notification: updated,
  };
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification:allRead');
  }

  return {
    message: 'All notifications marked as read',
  };
};

module.exports = {
  getNotifications,
  markAllRead,
  markRead,
  sendEmail,
  sendNotification,
};
