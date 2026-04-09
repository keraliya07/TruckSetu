const prisma = require('../config/db');
const { verifyAccessToken } = require('../utils/jwt.utils');
const ApiError = require('../utils/apiError.utils');
const { TtlCache } = require('../utils/cache.utils');

const SESSION_CACHE_TTL_MS = 10 * 1000;
const sessionCache = new TtlCache(SESSION_CACHE_TTL_MS);
const userSessionIndex = new Map();

const rememberSession = (sessionId, userId, session) => {
  sessionCache.set(sessionId, session, SESSION_CACHE_TTL_MS);

  if (!userId) {
    return;
  }

  const sessionIds = userSessionIndex.get(userId) || new Set();
  sessionIds.add(sessionId);
  userSessionIndex.set(userId, sessionIds);
};

const invalidateSessionCache = (sessionId) => {
  sessionCache.delete(sessionId);

  for (const [userId, sessionIds] of userSessionIndex.entries()) {
    if (!sessionIds.has(sessionId)) {
      continue;
    }

    sessionIds.delete(sessionId);
    if (sessionIds.size === 0) {
      userSessionIndex.delete(userId);
    }
    break;
  }
};

const invalidateUserSessionCache = (userId) => {
  const sessionIds = userSessionIndex.get(userId);
  if (!sessionIds) {
    return;
  }

  for (const sessionId of sessionIds) {
    sessionCache.delete(sessionId);
  }

  userSessionIndex.delete(userId);
};

const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('No token provided'));
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access' || !payload.sessionId) {
      return next(ApiError.unauthorized('Invalid access token'));
    }

    const session =
      sessionCache.get(payload.sessionId) ||
      (await prisma.refreshSession.findUnique({
        where: { id: payload.sessionId },
        include: {
          user: {
            select: {
              id: true,
              accountStatus: true,
            },
          },
        },
      }));

    if (session?.user?.id) {
      rememberSession(payload.sessionId, session.user.id, session);
    }

    if (
      !session ||
      session.user.accountStatus !== 'ACTIVE' ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      invalidateSessionCache(payload.sessionId);
      return next(ApiError.unauthorized('Session expired or revoked'));
    }

    req.user = payload;
    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

module.exports = {
  authenticate,
  invalidateSessionCache,
  invalidateUserSessionCache,
};
