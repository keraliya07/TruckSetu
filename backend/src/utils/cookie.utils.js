const {
  COOKIE_DOMAIN,
  COOKIE_SAME_SITE,
  COOKIE_SECURE,
} = require('../config/env');

const REFRESH_COOKIE_NAME = 'stlos_refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

const getCookieBaseOptions = () => ({
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAME_SITE,
  path: REFRESH_COOKIE_PATH,
  ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
});

const setRefreshTokenCookie = (res, token, expiresAt) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...getCookieBaseOptions(),
    expires: expiresAt,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieBaseOptions());
};

const getRefreshTokenFromRequest = (req) => {
  const cookieHeader = req.headers.cookie || '';
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const cookie = parts.find((part) =>
    part.startsWith(`${REFRESH_COOKIE_NAME}=`)
  );

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(REFRESH_COOKIE_NAME.length + 1));
};

module.exports = {
  REFRESH_COOKIE_NAME,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
};
