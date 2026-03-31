// === backend/src/config/env.js ===
// Purpose: Validated environment variable exports — fail fast if required vars missing
// Dependencies: dotenv

// require('dotenv').config();  // TODO: uncomment

/**
 * TODO: Validate and export environment variables
 *
 * Steps:
 *   1. Define required variables: DATABASE_URL, REDIS_URL, JWT_SECRET
 *   2. For each required var: if missing, throw Error("Missing env: VAR_NAME")
 *   3. Export all env vars with sensible defaults:
 *
 * module.exports = {
 *   NODE_ENV: process.env.NODE_ENV || 'development',
 *   PORT: parseInt(process.env.PORT || '4000'),
 *   DATABASE_URL: process.env.DATABASE_URL,
 *   REDIS_URL: process.env.REDIS_URL,
 *   JWT_SECRET: process.env.JWT_SECRET,
 *   JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
 *   PYTHON_ML_URL: process.env.PYTHON_ML_URL || 'http://localhost:8000',
 *   OSRM_URL: process.env.OSRM_URL || 'http://localhost:5000',
 *   CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
 *   SMTP_HOST: process.env.SMTP_HOST,
 *   SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
 *   SMTP_USER: process.env.SMTP_USER,
 *   SMTP_PASS: process.env.SMTP_PASS,
 *   BOOKING_TIMEOUT_HOURS: parseInt(process.env.BOOKING_TIMEOUT_HOURS || '2'),
 *   RETURN_LOAD_EXPIRY_HOURS: parseInt(process.env.RETURN_LOAD_EXPIRY_HOURS || '4'),
 *   GPS_UPDATE_INTERVAL_MS: parseInt(process.env.GPS_UPDATE_INTERVAL_MS || '10000'),
 * };
 */
