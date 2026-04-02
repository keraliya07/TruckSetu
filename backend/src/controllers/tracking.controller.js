const service = require('../services/tracking.service');

exports.getLatestLocation = async (req, res, next) => {
  try {
    const result = await service.getLatestLocation(req.params.tripId, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getLocationHistory = async (req, res, next) => {
  try {
    const result = await service.getLocationHistory(
      req.params.tripId,
      req.query,
      req.user
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createLocationUpdate = async (req, res, next) => {
  try {
    const result = await service.broadcastLocation(req.params.tripId, req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
