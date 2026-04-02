const prisma = require('../config/db');
const { verifyAccessToken } = require('../utils/jwt.utils');
const ApiError = require('../utils/apiError.utils');

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

    const session = await prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            accountStatus: true,
          },
        },
      },
    });

    if (
      !session ||
      session.user.accountStatus !== 'ACTIVE' ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      return next(ApiError.unauthorized('Session expired or revoked'));
    }

    req.user = payload;
    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

module.exports = { authenticate };
