import { useEffect, useState } from 'react';

import { formatCompactNumber, formatDateTime } from '../../utils/formatters';

export default function OptimizationHistoryPanel({
  cacheKey,
  isLoading,
  onLoadCacheKey,
  onRefresh,
  runs,
}) {
  const [manualCacheKey, setManualCacheKey] = useState(cacheKey || '');

  useEffect(() => {
    setManualCacheKey(cacheKey || '');
  }, [cacheKey]);

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Cached runs</p>
          <h3 className="mt-2 font-heading text-3xl text-slate-950">
            Retrieve a previous optimization
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Reopen a saved optimization by cache key or from recent warehouse runs.
          </p>
        </div>
        <button className="btn-secondary" onClick={onRefresh} type="button">
          Refresh history
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          className="input-base flex-1 font-mono text-xs"
          onChange={(event) => setManualCacheKey(event.target.value)}
          placeholder="Paste an optimization cache key"
          value={manualCacheKey}
        />
        <button
          className="btn-primary"
          disabled={!manualCacheKey || isLoading}
          onClick={() => onLoadCacheKey(manualCacheKey)}
          type="button"
        >
          Load cached run
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {runs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
            No cached optimization runs yet.
          </div>
        ) : (
          runs.map((run) => (
            <article
              key={run.optimizationRunId}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {run.summary.shipmentCount} shipment(s) /{' '}
                    {run.summary.destinationCities.join(', ') || 'No destination'}
                  </p>
                  <p className="font-mono text-xs text-slate-500">{run.cacheKey}</p>
                  <p className="text-sm text-slate-600">
                    Requested {formatDateTime(run.requestedAt)} / source {run.source}
                  </p>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setManualCacheKey(run.cacheKey);
                    onLoadCacheKey(run.cacheKey);
                  }}
                  type="button"
                >
                  Open run
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Weight</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatCompactNumber(run.summary.totalWeightKg)} kg
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatCompactNumber(run.summary.totalVolumeM3)} m3
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Top candidate
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {run.topCandidate?.truck?.registrationNo || 'Unavailable'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Score {run.topCandidate?.scores?.composite?.toFixed?.(1) || '0.0'}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
