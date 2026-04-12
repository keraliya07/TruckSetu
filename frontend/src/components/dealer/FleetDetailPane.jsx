import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import * as truckApi from '../../api/truck.api';
import { useTruckStore } from '../../store/truckStore';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/formatters';

export default function FleetDetailPane({ truckId, onClose, onUpdate }) {
  const { updateTruckStatus, removeTruck } = useTruckStore();
  const [truck, setTruck] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTruck = async () => {
    if (!truckId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await truckApi.getTruckById(truckId);
      setTruck(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTruck().catch(() => {});
  }, [truckId]);

  const stats = useMemo(() => {
    const trips = truck?.trips || [];
    const completedTrips = trips.filter((trip) => trip.status === 'DELIVERED');
    const totalRevenue = trips.reduce(
      (sum, trip) => sum + Number(trip.actualCost || trip.estimatedCost || 0),
      0
    );
    const totalDistance = trips.reduce(
      (sum, trip) => sum + Number(trip.estimatedDistanceKm || 0),
      0
    );

    return {
      completedTrips: completedTrips.length,
      totalRevenue,
      totalDistance,
      avgUtilization: completedTrips.length ? 84 : trips.length ? 73 : 0,
    };
  }, [truck?.trips]);

  const activeTrip = truck?.trips?.find((trip) =>
    ['PLANNED', 'IN_TRANSIT'].includes(trip.status)
  );

  if (!truckId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          title="Select a fleet vehicle"
          description="Click on any truck to review commercial performance, change availability, and track trips."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingSpinner label="Loading fleet vehicle..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      </div>
    );
  }

  if (!truck) return null;

  return (
    <article className="flex h-full flex-col relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">

      {/* ── Pane Header ── */}
      <div className="flex-none border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Fleet Vehicle</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 truncate">
              {truck.registrationNo}
            </h2>
          </div>
          <button
            className="rounded-lg bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge animate={truck.status === 'ON_TRIP'} size="sm" status={truck.status} />
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/20">
            {truck.truckType}
          </span>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-8 custom-scrollbar">

        {/* Capacity & Operations */}
        <section>
          <p className="text-xs font-medium text-slate-400 mb-3">Capacity & Operations</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-400">Payload</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatNumber(truck.maxWeightKg)} <span className="text-sm font-medium text-slate-400">kg</span></p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-400">Current Zone</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{truck.currentCity || 'Unknown'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-400">Lifetime Revenue</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-400">Distance</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{formatNumber(stats.totalDistance)} km</p>
            </div>
          </div>
        </section>

        {/* Trips Tracker */}
        <section>
          <p className="text-xs font-medium text-slate-400 mb-3">Trips Tracker</p>
          {activeTrip ? (
            <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px shadow-md shadow-emerald-500/15">
              <div className="rounded-[11px] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-600">Active Trip</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-slate-900">{activeTrip.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                  </div>
                </div>
                <Link
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
                  to={`/dealer/trips/${activeTrip.id}`}
                >
                  Manage Execution
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
              <p className="text-sm text-slate-400">No active trip — accept a shipment invite to start.</p>
            </div>
          )}
        </section>

        {/* Unit Controls */}
        <section>
          <p className="text-xs font-medium text-slate-400 mb-3">Unit Controls</p>
          <div className="grid grid-cols-2 gap-2.5">
             {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((status) => (
               <button
                 key={status}
                 className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                   truck.status === status
                     ? 'border-freight-200 bg-freight-50 text-freight-700 pointer-events-none'
                     : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                 }`}
                 disabled={truck.status === status || isSaving}
                 onClick={async () => {
                   setIsSaving(true);
                   try {
                     await updateTruckStatus(truck.id, { status });
                     await loadTruck();
                     if (onUpdate) onUpdate();
                   } finally { setIsSaving(false); }
                 }}
                 type="button"
               >
                 Set {status.replace('_', ' ')}
               </button>
             ))}
             {!activeTrip ? (
               <button
                 className="rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                 disabled={isSaving}
                 onClick={async () => {
                   if (!window.confirm("Remove unit from system?")) return;
                   setIsSaving(true);
                   try {
                     await removeTruck(truck.id);
                     if (onClose) onClose();
                     if (onUpdate) onUpdate();
                   } finally { setIsSaving(false); }
                 }}
                 type="button"
               >
                 Unlist Unit
               </button>
             ) : null}
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
          Last updated {formatDateTime(truck.updatedAt)}
        </p>

      </div>
    </article>
  );
}
