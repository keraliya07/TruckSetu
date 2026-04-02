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
  const client = getTransporter();

  if (!client) {
    return false;
  }

  await client.sendMail({
    from: SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return true;
};

module.exports = {
  isMailConfigured,
  sendMail,
};
