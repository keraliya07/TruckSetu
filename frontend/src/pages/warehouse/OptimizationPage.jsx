import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import OptimizationHistoryPanel from '../../components/optimization/OptimizationHistoryPanel';
import OptimizationPanel from '../../components/optimization/OptimizationPanel';
import RoutePreview from '../../components/optimization/RoutePreview';
import ScoreBreakdown from '../../components/optimization/ScoreBreakdown';
import TruckFitCalculator from '../../components/optimization/TruckFitCalculator';
import { useAuth } from '../../hooks/useAuth';
import { useOptimization } from '../../hooks/useOptimization';
import { useShipmentStore } from '../../store/shipmentStore';
import { useTruckStore } from '../../store/truckStore';
import { formatNumber } from '../../utils/formatters';

export default function OptimizationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shipmentStore = useShipmentStore();
  const truckStore = useTruckStore();
  const optimization = useOptimization();

  const queryShipmentIds = searchParams.get('shipmentIds')?.split(',').filter(Boolean) || [];
  const queryCacheKey = searchParams.get('cacheKey') || '';

  useEffect(() => {
    shipmentStore.fetchShipments({ status: 'PENDING', page: 1, limit: 50 }).catch(() => {});
    truckStore.fetchTrucks({ status: 'AVAILABLE', page: 1, limit: 30 }).catch(() => {});
    optimization.loadHistory().catch(() => {});
  }, []);

  useEffect(() => {
    if (queryShipmentIds.length) {
      queryShipmentIds.forEach((shipmentId) => {
        if (!shipmentStore.selectedIds.includes(shipmentId)) {
          shipmentStore.toggleSelect(shipmentId);
        }
      });
    }
  }, [queryShipmentIds.join(','), shipmentStore.selectedIds.join(',')]);

  useEffect(() => {
    if (queryCacheKey) {
      optimization.loadCachedResult(queryCacheKey).catch(() => {});
    }
  }, [optimization.loadCachedResult, queryCacheKey]);

  const selectedShipments = useMemo(
    () =>
      shipmentStore.shipments.filter((shipment) =>
        shipmentStore.selectedIds.includes(shipment.id)
      ),
    [shipmentStore.selectedIds, shipmentStore.shipments]
  );

  const selectedWeight = selectedShipments.reduce(
    (sum, shipment) => sum + Number(shipment.weightKg || 0),
    0
  );

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title="Optimization studio"
      subtitle="Score available trucks against selected shipments, compare route and utilization fit, and carry the shortlist straight into booking."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/optimization', label: 'Optimization', active: true },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Selection</p>
            <h2 className="mt-3 font-heading text-3xl text-slate-950">
              {selectedShipments.length} shipment(s) ready for scoring
            </h2>
            <p className="mt-2 text-slate-600">
              Combined weight {formatNumber(selectedWeight)} kg across {truckStore.trucks.length} visible truck option(s).
            </p>
            {optimization.cacheKey ? (
              <p className="mt-3 text-sm text-slate-500">
                Last run source{' '}
                <span className="font-semibold text-slate-900">
                  {optimization.source || 'live'}
                </span>{' '}
                with cache key{' '}
                <span className="font-mono text-xs text-slate-700">
                  {optimization.cacheKey}
                </span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-secondary"
              onClick={() => shipmentStore.clearSelection()}
              type="button"
            >
              Clear selection
            </button>
            <button
              className="btn-primary"
              disabled={!selectedShipments.length || optimization.isOptimizing}
              onClick={() =>
                optimization.runOptimization({
                  shipmentIds: selectedShipments.map((shipment) => shipment.id),
                })
              }
              type="button"
            >
              {optimization.isOptimizing ? 'Running...' : 'Run optimization'}
            </button>
            <button
              className="btn-secondary"
              disabled={!selectedShipments.length || optimization.isOptimizing}
              onClick={() =>
                optimization.runOptimization({
                  shipmentIds: selectedShipments.map((shipment) => shipment.id),
                  forceRefresh: true,
                })
              }
              type="button"
            >
              Force refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shipmentStore.shipments.map((shipment) => (
            <label
              key={shipment.id}
              className={`rounded-3xl border px-4 py-4 transition ${
                shipmentStore.selectedIds.includes(shipment.id)
                  ? 'border-freight-500 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  checked={shipmentStore.selectedIds.includes(shipment.id)}
                  onChange={() => shipmentStore.toggleSelect(shipment.id)}
                  type="checkbox"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">
                    {shipment.title || shipment.referenceNo}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {shipment.originCity} to {shipment.destCity}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatNumber(shipment.weightKg)} kg and {formatNumber(shipment.volumeM3)} m3
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {optimization.error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {optimization.error}
          </div>
        ) : null}
      </section>

      <TruckFitCalculator
        defaultOriginCity={user?.warehouse?.city}
        onCreateShipment={(values) => {
          const query = new URLSearchParams({
            weightKg: String(values.weightKg),
            volumeM3: String(values.volumeM3),
            destCity: values.destCity,
          });
          navigate(`/warehouse/shipments/new?${query.toString()}`);
        }}
      />

      <OptimizationHistoryPanel
        cacheKey={optimization.cacheKey}
        isLoading={optimization.isOptimizing}
        onLoadCacheKey={(nextCacheKey) => {
          const query = new URLSearchParams(searchParams);
          query.set('cacheKey', nextCacheKey);
          navigate(`/warehouse/optimization?${query.toString()}`);
        }}
        onRefresh={() => optimization.loadHistory().catch(() => {})}
        runs={optimization.history}
      />

      {selectedShipments.length === 0 && optimization.results.length === 0 ? (
        <EmptyState
          title="Select shipments to start optimization"
          description="Choose one or more pending shipments above, or begin from the shipment board."
          action={
            <Link className="btn-primary" to="/warehouse/shipments">
              Open shipment board
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <OptimizationPanel
            activeResultId={optimization.selectedResult?.id}
            isLoading={optimization.isOptimizing}
            onBookTruck={(result) =>
              navigate(
                `/warehouse/bookings?shipmentIds=${selectedShipments.map((shipment) => shipment.id).join(',')}&truckId=${result.truck.id}`
              )
            }
            onViewRoute={(result) => optimization.selectResult(result)}
            results={optimization.results}
          />

          <div className="space-y-6">
            {optimization.selectedResult ? (
              <>
                <RoutePreview
                  estimatedDuration={optimization.selectedResult.route.estimatedDuration}
                  stops={optimization.selectedResult.route.stops}
                  totalDistanceKm={optimization.selectedResult.route.totalDistanceKm}
                  truckPosition={optimization.selectedResult.route.truckPosition}
                />
                <section className="panel p-5">
                  <h3 className="font-heading text-2xl text-slate-950">Score breakdown</h3>
                  <div className="mt-5">
                    <ScoreBreakdown
                      compositeScore={optimization.selectedResult.scores.composite}
                      scores={optimization.selectedResult.scores}
                    />
                  </div>
                </section>
              </>
            ) : (
              <EmptyState
                title="No scored route selected yet"
                description="Run optimization to generate truck candidates and preview the strongest route here."
              />
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
