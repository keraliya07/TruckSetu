// === backend/src/utils/osrm.utils.js ===
// Purpose: OSRM HTTP client wrapper for routing and distance matrix

const axios = require('axios');
const { OSRM_URL } = require('../config/env');

const OSRM_TIMEOUT_MS = 6000;

// ── Haversine fallback ────────────────────────────────────────────────────────
const haversineKm = (lngLat1, lngLat2) => {
  const toRad = (v) => (Number(v) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lngLat2[1] - lngLat1[1]);
  const dLng = toRad(lngLat2[0] - lngLat1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lngLat1[1])) * Math.cos(toRad(lngLat2[1])) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── getRoute ──────────────────────────────────────────────────────────────────
/**
 * Fetch a road-following route from OSRM.
 * @param {Array<[number, number]>} coordinates  [[lng, lat], ...]
 * @returns {Promise<{ distance: number, duration: number, geometry: GeoJSON.LineString, source: string }>}
 */
const getRoute = async (coordinates) => {
  if (!coordinates || coordinates.length < 2) {
    const first = coordinates?.[0] ?? [0, 0];
    return {
      distance: 0,
      duration: 0,
      geometry: { type: 'LineString', coordinates: [first] },
      source: 'trivial',
    };
  }

  const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_URL.replace(/\/$/, '')}/route/v1/driving/${coordStr}?geometries=geojson&overview=full`;

  try {
    const { data } = await axios.get(url, { timeout: OSRM_TIMEOUT_MS });
    const route = data.routes?.[0];
    if (!route) throw new Error('No routes returned');

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      source: 'osrm',
    };
  } catch {
    // Fallback: straight-line geometry + haversine distance
    let totalKm = 0;
    for (let i = 1; i < coordinates.length; i += 1) {
      totalKm += haversineKm(coordinates[i - 1], coordinates[i]);
    }
    totalKm = Math.max(totalKm * 1.18, 1);

    return {
      distance: Math.round(totalKm * 1000),
      duration: Math.round((totalKm / 42) * 3600),
      geometry: { type: 'LineString', coordinates },
      source: 'fallback',
    };
  }
};

// ── getDistanceMatrix ─────────────────────────────────────────────────────────
/**
 * Fetch an NxN distance/duration matrix from OSRM.
 * @param {Array<[number, number]>} coordinates  [[lng, lat], ...]
 * @returns {Promise<{ distances: number[][], durations: number[][], source: string }>}
 */
const getDistanceMatrix = async (coordinates) => {
  if (!coordinates || coordinates.length < 2) {
    const n = coordinates?.length ?? 0;
    return {
      distances: Array.from({ length: n }, () => Array(n).fill(0)),
      durations: Array.from({ length: n }, () => Array(n).fill(0)),
      source: 'trivial',
    };
  }

  const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_URL.replace(/\/$/, '')}/table/v1/driving/${coordStr}?annotations=distance,duration`;

  try {
    const { data } = await axios.get(url, { timeout: OSRM_TIMEOUT_MS });
    return {
      distances: data.distances,
      durations: data.durations,
      source: 'osrm',
    };
  } catch {
    // Fallback: haversine matrix
    const n = coordinates.length;
    const distances = [];
    const durations = [];
    for (let i = 0; i < n; i += 1) {
      distances.push([]);
      durations.push([]);
      for (let j = 0; j < n; j += 1) {
        const km = haversineKm(coordinates[i], coordinates[j]);
        distances[i].push(Math.round(km * 1000));
        durations[i].push(Math.round((km / 42) * 3600));
      }
    }
    return { distances, durations, source: 'fallback' };
  }
};

module.exports = { getRoute, getDistanceMatrix };
