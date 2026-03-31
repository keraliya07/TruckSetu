// === backend/src/services/notification.service.js ===
// Purpose: Send in-app and email notifications
// Dependencies: ../config/db, ../config/socket, nodemailer

// const prisma = require('../config/db');          // TODO: uncomment
// const { getIO } = require('../config/socket');  // TODO: uncomment
// const nodemailer = require('nodemailer');         // TODO: uncomment

/**
 * TODO: Implement sendNotification
 * @param {{ userId, type, title, message, link }} notification
 *
 * Steps:
 *   1. Save to DB: prisma.notification.create({ data: notification })
 *   2. Emit to user's socket room: io.to(\`user:\${userId}\`).emit('notification:new', notification)
 *   3. Optionally send email (if user has email notifications enabled)
 */

/**
 * TODO: Implement sendEmail
 * @param {{ to, subject, html }} options
 *
 * Use nodemailer with SMTP config from env
 */

/**
 * TODO: Implement markRead, markAllRead, getNotifications
 */

// module.exports = { sendNotification, sendEmail, markRead, markAllRead, getNotifications };
