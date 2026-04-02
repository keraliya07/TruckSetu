import { useCallback, useState } from 'react';

import * as optimizationApi from '../api/optimization.api';

export function useOptimization() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [cacheKey, setCacheKey] = useState('');
  const [source, setSource] = useState('');
  const [optimizationRunId, setOptimizationRunId] = useState('');
  const [history, setHistory] = useState([]);

  const applyResult = useCallback((response) => {
    const nextResults = response?.trucks || [];
    setResults(nextResults);
    setSelectedResult(nextResults[0] || null);
    setCacheKey(response?.cacheKey || '');
    setSource(response?.source || '');
    setOptimizationRunId(response?.optimizationRunId || '');
    return nextResults;
  }, []);

  const runOptimization = useCallback(
    async ({ shipmentIds, forceRefresh = false }) => {
      setIsOptimizing(true);
      setError(null);

      try {
        if (!shipmentIds?.length) {
          throw new Error('Select at least one shipment before running optimization');
        }

        const response = await optimizationApi.runOptimization({
          shipmentIds,
          forceRefresh,
        });

        return applyResult(response);
      } catch (runError) {
        setError(runError.message);
        throw runError;
      } finally {
        setIsOptimizing(false);
      }
    },
    [applyResult]
  );

  const loadCachedResult = useCallback(
    async (nextCacheKey) => {
      setIsOptimizing(true);
      setError(null);

      try {
        const response = await optimizationApi.getOptimizationResult(nextCacheKey);
        return applyResult(response);
      } catch (loadError) {
        setError(loadError.message);
        throw loadError;
      } finally {
        setIsOptimizing(false);
      }
    },
    [applyResult]
  );

  const loadHistory = useCallback(async (limit = 8) => {
    try {
      const response = await optimizationApi.getOptimizationHistory({ limit });
      setHistory(response?.runs || []);
      return response?.runs || [];
    } catch (loadError) {
      setError(loadError.message);
      throw loadError;
    }
  }, []);

  return {
    cacheKey,
    clearResults: () => {
      setResults([]);
      setSelectedResult(null);
      setError(null);
      setCacheKey('');
      setSource('');
      setOptimizationRunId('');
    },
    error,
    history,
    isOptimizing,
    loadHistory,
    loadCachedResult,
    optimizationRunId,
    results,
    runOptimization,
    selectedResult,
    selectResult: setSelectedResult,
    source,
  };
}
