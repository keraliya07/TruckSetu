const returnLoadService = require('../services/returnLoad.service');

async function triggerReturnLoadMatching(tripId, options = {}) {
  const service = options.service || returnLoadService;

  if (!tripId) {
    return { matches: [], trip: null };
  }

  return service.findReturnLoads(tripId);
}

module.exports = {
  triggerReturnLoadMatching,
};
