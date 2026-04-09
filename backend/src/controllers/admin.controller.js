const service = require('../services/admin.service');

exports.getUsers = async (req, res, next) => {
  try {
    const result = await service.getUsers(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const result = await service.getUserById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const result = await service.updateUserStatus(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.createAnalyst = async (req, res, next) => {
  try {
    const result = await service.createAnalyst(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
