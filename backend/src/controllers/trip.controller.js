const service = require('../services/trip.service');
const trackingService = require('../services/tracking.service');

exports.getAll = async (req, res, next) => {
  try {
    const result = await service.getAll(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await service.getById(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.start = async (req, res, next) => {
  try {
    const result = await service.start(req.params.id, req.user);
    await trackingService.emitTripState(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.completeStop = async (req, res, next) => {
  try {
    const result = await trackingService.completeStop(
      req.params.id,
      req.params.stopId,
      req.user
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
