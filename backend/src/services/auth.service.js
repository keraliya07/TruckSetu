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
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');
const { sendMail } = require('../utils/mail.utils');

const demoAccounts = [
  {
    role: 'WAREHOUSE',
    email: 'warehouse@stlos.dev',
    password: 'Warehouse123',
  },
  {
    role: 'DEALER',
    email: 'dealer@stlos.dev',
    password: 'Dealer123',
  },
  {
    role: 'ADMIN',
    email: 'admin@stlos.dev',
    password: 'Admin123',
  },
];

const userInclude = {
  warehouse: true,
  truckDealer: true,
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
      subject: 'Verify your STLOS email',
      text: `Verify your email by opening this link: ${verificationUrl}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Verify your STLOS email by opening the link below:</p>
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
      subject: 'Reset your STLOS password',
      text: `Reset your password by opening this link: ${resetUrl}`,
      html: `
        <p>Hello ${user.name},</p>
        <p>Reset your STLOS password by opening the link below:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });
  } catch (error) {
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
  const session = await prisma.refreshSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: '',
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
      expiresAt: new Date(),
      lastUsedAt: new Date(),
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });
  const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

  await prisma.refreshSession.update({
    where: { id: session.id },
    data: {
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
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await prisma.user.create({
    data: {
      email,
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
  const user = await prisma.user.findUnique({
    where: { email },
    include: userInclude,
  });

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

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(updates.name ? { name: updates.name } : {}),
      ...(typeof updates.phone === 'string' ? { phone: updates.phone || null } : {}),
      ...(user.role === 'ADMIN' ? { profileComplete: true } : {}),
    },
  });

  if (user.role === 'WAREHOUSE' && updates.warehouse) {
    await prisma.warehouse.upsert({
      where: { userId },
      update: {
        warehouseName: updates.warehouse.warehouseName,
        city: updates.warehouse.city,
        address: updates.warehouse.address,
      },
      create: {
        userId,
        warehouseName: updates.warehouse.warehouseName,
        city: updates.warehouse.city,
        address: updates.warehouse.address,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { profileComplete: true },
    });
  }

  if (user.role === 'DEALER' && updates.truckDealer) {
    await prisma.truckDealer.upsert({
      where: { userId },
      update: {
        companyName: updates.truckDealer.companyName,
        primaryCity: updates.truckDealer.primaryCity,
        baseRatePerKmTon: updates.truckDealer.baseRatePerKmTon,
      },
      create: {
        userId,
        companyName: updates.truckDealer.companyName,
        primaryCity: updates.truckDealer.primaryCity,
        baseRatePerKmTon: updates.truckDealer.baseRatePerKmTon,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { profileComplete: true },
    });
  }

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
  const user = await prisma.user.findUnique({
    where: { email },
  });

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

  return {
    message: 'Password reset successful. Please sign in again.',
  };
};

const listSessions = async (userId, currentSessionId) => {
  const sessions = await prisma.refreshSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((session) => ({
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    isCurrent: session.id === currentSessionId,
  }));
};

const revokeSession = async (userId, currentSessionId, sessionId) => {
  if (sessionId === currentSessionId) {
    throw ApiError.badRequest('Use sign out to revoke the current session');
  }

  const session = await prisma.refreshSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw ApiError.notFound('Session not found');
  }

  await prisma.refreshSession.update({
    where: { id: sessionId },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    message: 'Session revoked.',
  };
};

const revokeOtherSessions = async (userId, currentSessionId) => {
  const result = await prisma.refreshSession.updateMany({
    where: {
      userId,
      id: { not: currentSessionId },
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return {
    message: 'Other sessions revoked.',
    revokedCount: result.count,
  };
};

const listDemoAccounts = async () => demoAccounts;

module.exports = {
  forgotPassword,
  getProfile,
  listDemoAccounts,
  listSessions,
  login,
  logout,
  refreshSession,
  register,
  resetPassword,
  revokeOtherSessions,
  revokeSession,
  sendVerificationEmail,
  updateProfile,
  verifyEmail,
};
