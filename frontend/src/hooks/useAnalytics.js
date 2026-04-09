import { useEffect, useState } from 'react';

import { getCO2Data, getDashboardKPIs, getRevenueData, getUtilizationData } from '../api/analytics.api';

export function useAnalytics(_scope = 'dealer', period = '30d') {
  const [state, setState] = useState({
    analytics: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const baseParams = { period };
        const [kpis, revenue, utilization, co2] = await Promise.all([
          getDashboardKPIs(baseParams),
          getRevenueData(baseParams),
          getUtilizationData(baseParams),
          getCO2Data(baseParams),
        ]);

        if (cancelled) {
          return;
        }

        setState({
          isLoading: false,
          error: null,
          analytics: {
            ...kpis,
            revenueSeries: revenue.series || [],
            utilizationSeries: utilization.series || [],
            co2Series: {
              totalSaved: co2.totalSaved || 0,
              perTripAvg: co2.perTripAvg || 0,
              timeSeries: co2.timeSeries || [],
            },
          },
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          analytics: null,
          error: error.message || 'Failed to load analytics',
          isLoading: false,
        });
      }
    }

    loadAnalytics().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [period]);

  return state;
}
