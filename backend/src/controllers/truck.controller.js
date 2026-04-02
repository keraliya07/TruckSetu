const service = require('../services/truck.service');

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

exports.create = async (req, res, next) => {
  try {
    const result = await service.create(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await service.update(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const result = await service.updateStatus(req.params.id, req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await service.remove(req.params.id, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
