// === frontend/src/api/analytics.api.js ===
// Purpose: Analytics dashboard data API calls
// Dependencies: ./axiosInstance

// import api from './axiosInstance';   // TODO: uncomment

/**
 * TODO: Implement getDashboardKPIs
 * GET /analytics/kpis?period=...
 * @param {{ period: '7d'|'30d'|'90d'|'1y' }} params
 * @returns {Promise<{ totalTrips, totalRevenue, avgUtilization, co2Saved, activeShipments }>}
 */
// export const getDashboardKPIs = (params) => api.get('/analytics/kpis', { params });

/**
 * TODO: Implement getUtilizationData
 * GET /analytics/utilization?period=...&groupBy=...
 * @param {{ period: string, groupBy: 'day'|'week'|'month' }} params
 * @returns {Promise<array>} Time series data for utilization charts
 */
// export const getUtilizationData = (params) => api.get('/analytics/utilization', { params });

/**
 * TODO: Implement getRevenueData
 * GET /analytics/revenue?period=...
 * @returns {Promise<array>} Time series revenue data
 */
// export const getRevenueData = (params) => api.get('/analytics/revenue', { params });

/**
 * TODO: Implement getCO2Data
 * GET /analytics/co2?period=...
 * @returns {Promise<{ totalSaved, perTripAvg, timeSeries: array }>}
 */
// export const getCO2Data = (params) => api.get('/analytics/co2', { params });

/**
 * TODO: Implement getDemandForecast
 * GET /analytics/demand-forecast?city=...&horizon=...
 * @param {{ city?: string, horizon: '7d'|'30d' }} params
 * @returns {Promise<array>} Forecasted demand per city per day
 */
// export const getDemandForecast = (params) => api.get('/analytics/demand-forecast', { params });

/**
 * TODO: Implement downloadCO2Report
 * GET /analytics/co2-report/download?tripId=...
 * @param {string} tripId
 * @returns {Promise<Blob>} PDF file
 */
// export const downloadCO2Report = (tripId) => api.get(`/analytics/co2-report/download`, { params: { tripId }, responseType: 'blob' });
