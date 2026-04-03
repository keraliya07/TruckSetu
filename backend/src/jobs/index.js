const { JOBS_ENABLED } = require('../config/env');
const { startBookingTimeoutJob, stopBookingTimeoutJob } = require('./bookingTimeout.job');
const { startMLRetrainJob, stopMLRetrainJob } = require('./mlRetrain.job');
const { stopAllSimulators } = require('./gpsSimulator.job');

let started = false;

function startBackgroundJobs() {
  if (started || !JOBS_ENABLED) {
    return;
  }

  startBookingTimeoutJob();
  startMLRetrainJob();
  started = true;
}

function stopBackgroundJobs() {
  if (!started && !JOBS_ENABLED) {
    stopAllSimulators();
    return;
  }

  stopBookingTimeoutJob();
  stopMLRetrainJob();
  stopAllSimulators();
  started = false;
}

module.exports = {
  startBackgroundJobs,
  stopBackgroundJobs,
};
