// === backend/src/utils/osrm.utils.js ===
// Purpose: OSRM HTTP client wrapper for routing and distance matrix
// Dependencies: axios, ../config/env

// const axios = require('axios');
// const { OSRM_URL } = require('../config/env');

/**
 * TODO: Implement getRoute
 * @param {Array<[number, number]>} coordinates — [[lng, lat], ...]
 * @returns {Promise<{ distance, duration, geometry }>}
 *
 * GET {OSRM_URL}/route/v1/driving/{coords}?geometries=geojson&overview=full
 */

/**
 * TODO: Implement getDistanceMatrix
 * @param {Array<[number, number]>} coordinates — [[lng, lat], ...]
 * @returns {Promise<{ distances: number[][], durations: number[][] }>}
 *
 * GET {OSRM_URL}/table/v1/driving/{coords}?annotations=distance,duration
 */

// module.exports = { getRoute, getDistanceMatrix };
