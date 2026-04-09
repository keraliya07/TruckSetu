const crypto = require('crypto');

const prisma = require('../config/db');
const {
  APP_BASE_URL,
  EMAIL_VERIFICATION_TOKEN_TTL_HOURS,
  NODE_ENV,
  PASSWORD_RESET_TOKEN_TTL_HOURS,
} = require('../config/env');
const { comparePassword, hashPassword } = require('../utils/bcrypt.utils');
const ApiError = require('../utils/apiError.utils');
const {
  invalidateSessionCache,
  invalidateUserSessionCache,
} = require('../middleware/auth.middleware');
const {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');
const { sendMail } = require('../utils/mail.utils');
const { resolveCityCoordinates } = require('../utils/cityCoordinates');

const demoAccounts = [
  {
    role: 'WAREHOUSE',
    email: 'warehouse@trucksetu.dev',
    password: 'Warehouse123',
  },
  {
    role: 'DEALER',
    email: 'dealer@trucksetu.dev',
    password: 'Dealer123',
  },
  {
    role: 'ADMIN',
    email: 'admin@trucksetu.dev',
    password: 'Admin123',
  },
];

const LEGACY_DEMO_DOMAIN = 'stlos.dev';
const CURRENT_DEMO_DOMAIN = 'trucksetu.dev';

const userInclude = {
  warehouse: true,
  truckDealer: true,
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const getEmailCandidates = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.includes('@')) {
    return [normalizedEmail];
  }

  const [localPart, domain] = normalizedEmail.split('@');

  if (!localPart || !domain) {
    return [normalizedEmail];
  }

  const candidates = [normalizedEmail];

  if (domain === CURRENT_DEMO_DOMAIN) {
    candidates.push(`${localPart}@${LEGACY_DEMO_DOMAIN}`);
  } else if (domain === LEGACY_DEMO_DOMAIN) {
    candidates.push(`${localPart}@${CURRENT_DEMO_DOMAIN}`);
  }

  return candidates;
};

const findUserByEmail = async (email) => {
  const candidates = getEmailCandidates(email);

  // Single query with IN instead of sequential loop — saves 1 round-trip for dual-domain lookups
  return prisma.user.findFirst({
    where: { email: { in: candidates } },
    include: userInclude,
  });
};

const toSafeUser = (user) => {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const createOpaqueToken = () => crypto.randomBytes(32).toString('hex');

const getTokenExpiryDate = (token) => {
  const decoded = decodeToken(token);

  if (!decoded?.exp) {
    throw ApiError.internal('Unable to determine token expiry');
  }

  return new Date(decoded.exp * 1000);
};

const addHours = (date, hours) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

const devMeta = (url, token) =>
  NODE_ENV === 'production'
    ? {}
    : {
        devUrl: url,
        devToken: token,
      };

const assertActiveUser = (user) => {
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw ApiError.forbidden('Account is not active');
  }
};

const buildVerifyEmailUrl = (token) =>
  `${APP_BASE_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;

const buildResetPasswordUrl = (token) =>
  `${APP_BASE_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

const dispatchEmailVerification = async (user) => {
  if (user.isEmailVerified) {
    return {
      alreadyVerified: true,
      message: 'Email is already verified.',
    };
  }

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  });

  const token = createOpaqueToken();
  const expiresAt = addHours(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_HOURS);
  const verificationUrl = buildVerifyEmailUrl(token);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  let emailSent = false;

  try {
    emailSent = await sendMail({
      to: user.email,
      subject: 'Verify your TruckSetu email',
      text: `Verify your email by opening this link: ${verificationUrl}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Verify your TruckSetu email by opening the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
    });
  } catch (error) {
    emailSent = false;
  }

  return {
    emailSent,
    message: emailSent
      ? 'Verification email sent.'
      : 'Verification link generated.',
    ...devMeta(verificationUrl, token),
  };
};

const dispatchPasswordReset = async (user) => {
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      consumedAt: null,
    },
  });

  const token = createOpaqueToken();
  const expiresAt = addHours(new Date(), PASSWORD_RESET_TOKEN_TTL_HOURS);
  const resetUrl = buildResetPasswordUrl(token);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  let emailSent = false;

  try {
    emailSent = await sendMail({
      to: user.email,
      subject: 'Reset your TruckSetu password',
      text: `Reset your password by opening this link: ${resetUrl}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Reset your TruckSetu password by opening the link below:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });
  } catch (error) {
    console.error('[AUTH] Password reset email failed:', error.message);
    emailSent = false;
  }

  return {
    emailSent,
    message: emailSent
      ? 'Password reset email sent if the account exists.'
      : 'Password reset link generated if the account exists.',
    ...devMeta(resetUrl, token),
  };
};

const createSessionTokens = async (user, context = {}) => {
  // Pre-generate session ID so we can build tokens before hitting DB — saves 1 round-trip
  const sessionId = crypto.randomUUID();

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId,
  });
  const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
      lastUsedAt: new Date(),
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
    },
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
    user: toSafeUser(user),
  };
};

const register = async ({ email, password, name, phone, role }, context = {}) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      name,
      phone: phone || null,
      role,
      profileComplete: false,
      isEmailVerified: false,
    },
    include: userInclude,
  });

  const authResult = await createSessionTokens(user, context);
  const verification = await dispatchEmailVerification(user);

  return {
    ...authResult,
    verification,
  };
};

const login = async ({ email, password }, context = {}) => {
  const user = await findUserByEmail(email);

  assertActiveUser(user);

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  return createSessionTokens(user, context);
};

const refreshSession = async (refreshToken, context = {}) => {
  if (!refreshToken) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh' || !payload.sessionId || !payload.userId) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const session = await prisma.refreshSession.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        include: userInclude,
      },
    },
  });

  if (!session || session.userId !== payload.userId) {
    throw ApiError.unauthorized('Session not found');
  }

  if (session.revokedAt || session.expiresAt <= new Date()) {
    throw ApiError.unauthorized('Session expired or revoked');
  }

  assertActiveUser(session.user);

  if (session.refreshTokenHash !== hashToken(refreshToken)) {
    invalidateSessionCache(session.id);
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
      },
    });

    throw ApiError.unauthorized('Refresh token reuse detected');
  }

  const accessToken = generateAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    sessionId: session.id,
  });
  const nextRefreshToken = generateRefreshToken({
    userId: session.user.id,
    sessionId: session.id,
  });
  const refreshTokenExpiresAt = getTokenExpiryDate(nextRefreshToken);

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(nextRefreshToken),
      expiresAt: refreshTokenExpiresAt,
      lastUsedAt: new Date(),
      userAgent: context.userAgent || session.userAgent,
      ipAddress: context.ipAddress || session.ipAddress,
    },
  });
  invalidateSessionCache(session.id);

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt,
    user: toSafeUser(session.user),
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload.sessionId) {
      return;
    }

    const session = await prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.refreshTokenHash !== hashToken(refreshToken)) {
      return;
    }

    invalidateSessionCache(session.id);
    await prisma.refreshSession.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    // Clearing the cookie client-side is enough if the token is already invalid.
  }
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return toSafeUser(user);
};

const updateProfile = async (userId, updates) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userInclude,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Batch all writes in a single transaction — saves 2-3 sequential round-trips
  const operations = [];

  const userUpdateData = {
    ...(updates.name ? { name: updates.name } : {}),
    ...(typeof updates.phone === 'string' ? { phone: updates.phone || null } : {}),
  };

  const needsProfileComplete =
    user.role === 'ADMIN' ||
    (user.role === 'WAREHOUSE' && updates.warehouse) ||
    (user.role === 'DEALER' && updates.truckDealer);

  if (needsProfileComplete) {
    userUpdateData.profileComplete = true;
  }

  operations.push(
    prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    })
  );

  if (user.role === 'WAREHOUSE' && updates.warehouse) {
    const warehouseLocation = resolveCityCoordinates(updates.warehouse.city);

    operations.push(
      prisma.warehouse.upsert({
        where: { userId },
        update: {
          warehouseName: updates.warehouse.warehouseName,
          city: warehouseLocation?.city || updates.warehouse.city,
          address: updates.warehouse.address,
          latitude: warehouseLocation?.lat ?? null,
          longitude: warehouseLocation?.lng ?? null,
        },
        create: {
          userId,
          warehouseName: updates.warehouse.warehouseName,
          city: warehouseLocation?.city || updates.warehouse.city,
          address: updates.warehouse.address,
          latitude: warehouseLocation?.lat ?? null,
          longitude: warehouseLocation?.lng ?? null,
        },
      })
    );
  }

  if (user.role === 'DEALER' && updates.truckDealer) {
    const dealerLocation = resolveCityCoordinates(updates.truckDealer.primaryCity);

    operations.push(
      prisma.truckDealer.upsert({
        where: { userId },
        update: {
          companyName: updates.truckDealer.companyName,
          primaryCity: dealerLocation?.city || updates.truckDealer.primaryCity,
          baseRatePerKmTon: updates.truckDealer.baseRatePerKmTon,
          primaryLat: dealerLocation?.lat ?? null,
          primaryLng: dealerLocation?.lng ?? null,
        },
        create: {
          userId,
          companyName: updates.truckDealer.companyName,
          primaryCity: dealerLocation?.city || updates.truckDealer.primaryCity,
          baseRatePerKmTon: updates.truckDealer.baseRatePerKmTon,
          primaryLat: dealerLocation?.lat ?? null,
          primaryLng: dealerLocation?.lng ?? null,
        },
      })
    );
  }

  await prisma.$transaction(operations);

  return getProfile(userId);
};

const sendVerificationEmail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return dispatchEmailVerification(user);
};

const verifyEmail = async (token) => {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: userInclude,
      },
    },
  });

  if (!record || record.consumedAt || record.expiresAt <= new Date()) {
    throw ApiError.badRequest('Verification link is invalid or expired');
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { isEmailVerified: true },
    }),
  ]);

  return {
    message: 'Email verified successfully.',
    user: toSafeUser({
      ...record.user,
      isEmailVerified: true,
    }),
  };
};

const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      message: 'If the account exists, password reset instructions were generated.',
    };
  }

  return dispatchPasswordReset(user);
};

const resetPassword = async ({ password, token }) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.consumedAt || record.expiresAt <= new Date()) {
    throw ApiError.badRequest('Reset link is invalid or expired');
  }

  const nextHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: nextHash },
    }),
    prisma.refreshSession.updateMany({
      where: {
        userId: record.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);
  invalidateUserSessionCache(record.userId);

  return {
    message: 'Password reset successful. Please sign in again.',
  };
};

const listDemoAccounts = async () => demoAccounts;

module.exports = {
  forgotPassword,
  getProfile,
  listDemoAccounts,
  login,
  logout,
  refreshSession,
  register,
  resetPassword,
  sendVerificationEmail,
  updateProfile,
  verifyEmail,
};
