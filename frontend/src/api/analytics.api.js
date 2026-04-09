import api from './axiosInstance';

export function getDashboardKPIs(params) {
  return api.get('/analytics/kpis', { params });
}

export function getUtilizationData(params) {
  return api.get('/analytics/utilization', { params });
}

export function getRevenueData(params) {
  return api.get('/analytics/revenue', { params });
}

export function getCO2Data(params) {
  return api.get('/analytics/co2', { params });
}

export function downloadCO2Report(tripId) {
  return api.get('/analytics/co2-report/download', {
    params: { tripId },
    responseType: 'blob',
  });
}
