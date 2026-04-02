const service = require('../services/booking.service');

exports.create = async (req, res, next) => {
  try {
    const result = await service.create(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

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

exports.respond = async (req, res, next) => {
  try {
    const result = await service.respond(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.acceptCounter = async (req, res, next) => {
  try {
    const result = await service.acceptCounter(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
