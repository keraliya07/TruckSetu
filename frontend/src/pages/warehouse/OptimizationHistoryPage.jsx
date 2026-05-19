import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getOptimizationHistory } from '../../api/optimization.api';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import { formatDateTime } from '../../utils/formatters';

export default function OptimizationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOptimizationHistory({ limit: 15 });
        if (!cancelled) {
          setHistory(data.history || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load optimization history');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title="Optimization History"
      subtitle="View recent ML truck scoring and matching runs for your shipments."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
          { to: '/warehouse/optimization-history', label: 'Optimization', active: true },
        ]}
      />

      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <LoadingSpinner label="Loading history..." />
        ) : error ? (
          <div className="m-6 rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="m-auto text-center p-8">
            <p className="text-sm text-slate-500">No optimization history found. Score trucks for a shipment to see results here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Cache Key / Run ID</th>
                  <th className="px-6 py-4">Shipment IDs</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Time Taken</th>
                  <th className="px-6 py-4">Run Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {history.map((run) => (
                  <tr key={run.cacheKey} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {run.cacheKey.slice(0, 16)}...
                    </td>
                    <td className="px-6 py-4">
                      {run.shipmentIds?.length || 0} shipment(s)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${run.source === 'ml' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {run.source?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{run.executionTimeMs} ms</td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDateTime(run.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
