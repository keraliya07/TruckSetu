const service = require('../services/optimization.service');

exports.scoreTrucks = async (req, res, next) => {
  try {
    const result = await service.scoreTrucks(req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCachedResult = async (req, res, next) => {
  try {
    const result = await service.getCachedResult(req.params.cacheKey, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const result = await service.getHistory(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.truckFitEstimate = async (req, res, next) => {
  try {
    const result = await service.truckFitEstimate(req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
