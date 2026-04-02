require('dotenv').config();

const { z } = require('zod');

const toBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
};

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default(process.env.JWT_EXPIRES_IN || '15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  PYTHON_ML_URL: z.string().default('http://localhost:8000'),
  OSRM_URL: z.string().default('http://router.project-osrm.org'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  COOKIE_SECURE: z.preprocess(toBoolean, z.boolean().default(false)),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().default(''),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_VERIFICATION_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(24),
  PASSWORD_RESET_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(2),
  BOOKING_TIMEOUT_HOURS: z.coerce.number().int().positive().default(2),
  RETURN_LOAD_EXPIRY_HOURS: z.coerce.number().int().positive().default(4),
  GPS_UPDATE_INTERVAL_MS: z.coerce.number().int().positive().default(10000),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment configuration: ${message}`);
}

module.exports = parsed.data;
