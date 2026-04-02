const service = require('../services/notification.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await service.getNotifications(req.user.userId, req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const result = await service.markRead(req.user.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const result = await service.markAllRead(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
