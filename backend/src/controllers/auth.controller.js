const service = require('../services/auth.service');
const {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  setRefreshTokenCookie,
} = require('../utils/cookie.utils');

exports.login = async (req, res, next) => {
  try {
    const result = await service.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(200).json({
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const result = await service.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(201).json({
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user,
      verification: result.verification,
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const result = await service.refreshSession(getRefreshTokenFromRequest(req), {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.status(200).json({
      token: result.accessToken,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const result = await service.getProfile(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const result = await service.updateProfile(req.user.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDemoAccounts = async (req, res, next) => {
  try {
    const result = await service.listDemoAccounts();
    res.status(200).json({ accounts: result });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await service.logout(getRefreshTokenFromRequest(req));
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const result = await service.sendVerificationEmail(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const result = await service.verifyEmail(req.body.token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await service.forgotPassword(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const result = await service.resetPassword(req.body);
    clearRefreshTokenCookie(res);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
