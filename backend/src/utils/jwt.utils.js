const jwt = require('jsonwebtoken');
const {
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} = require('../config/env');

const generateAccessToken = (payload) =>
  jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const generateRefreshToken = (payload) =>
  jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

const decodeToken = (token) => jwt.decode(token);

module.exports = {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
