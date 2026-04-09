const nodemailer = require('nodemailer');

const { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } = require('../config/env');

let transporter;

const isPlaceholder = (value) =>
  !value ||
  value.includes('your-email@gmail.com') ||
  value.includes('your-app-password');

const isMailConfigured = () =>
  Boolean(SMTP_HOST) && !isPlaceholder(SMTP_USER) && !isPlaceholder(SMTP_PASS);

const getTransporter = () => {
  if (!isMailConfigured()) {
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

const sendMail = async ({ html, subject, text, to }) => {
  console.log('[MAIL] isMailConfigured:', isMailConfigured());
  console.log('[MAIL] SMTP_HOST:', SMTP_HOST, 'SMTP_PORT:', SMTP_PORT, 'SMTP_USER:', SMTP_USER);

  const client = getTransporter();

  if (!client) {
    console.warn('[MAIL] Transporter not available — SMTP not configured');
    return false;
  }

  try {
    const info = await client.sendMail({
      from: SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    console.log('[MAIL] Email sent successfully to:', to, 'messageId:', info.messageId);
    return true;
  } catch (err) {
    console.error('[MAIL] Failed to send email to:', to);
    console.error('[MAIL] Error:', err.message);
    console.error('[MAIL] Full error:', err);
    throw err;
  }
};

module.exports = {
  isMailConfigured,
  sendMail,
};
