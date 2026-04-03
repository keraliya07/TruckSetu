const service = require('../services/analytics.service');

exports.getKPIs = async (req, res, next) => {
  try {
    const result = await service.getKPIs(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getUtilization = async (req, res, next) => {
  try {
    const result = await service.getUtilization(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getRevenue = async (req, res, next) => {
  try {
    const result = await service.getRevenue(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getCO2 = async (req, res, next) => {
  try {
    const result = await service.getCO2(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDemandForecast = async (req, res, next) => {
  try {
    const result = await service.getDemandForecast(req.query, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.downloadCO2Report = async (req, res, next) => {
  try {
    const result = await service.downloadCO2Report(req.query, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.status(200).send(result.buffer);
  } catch (error) {
    next(error);
  }
};
