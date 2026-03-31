// === backend/src/jobs/mlRetrain.job.js ===
// Purpose: Weekly cron to trigger ML model retraining in Python service
// Dependencies: node-cron, axios, ../config/env

// const cron = require('node-cron');
// const axios = require('axios');

/**
 * TODO: Schedule: '0 2 * * 0' (every Sunday at 2 AM)
 *
 * Steps:
 *   1. Call Python ML service: POST /internal/retrain
 *   2. Log success/failure
 *   3. Notify admin if retraining fails
 *
 * Models retrained: Price prediction (RandomForest), Demand forecast (Prophet)
 */

// function startMLRetrainJob() { /* TODO */ }
// module.exports = { startMLRetrainJob };
