const service = require('../services/returnLoad.service');

exports.getMatches = async (req, res, next) => {
  try {
    const result = await service.getMatches(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.acceptMatch = async (req, res, next) => {
  try {
    const result = await service.acceptMatch(req.params.matchId, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.rejectMatch = async (req, res, next) => {
  try {
    const result = await service.rejectMatch(req.params.matchId, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
