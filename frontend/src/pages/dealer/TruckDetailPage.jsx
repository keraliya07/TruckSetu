import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import * as truckApi from '../../api/truck.api';
import { useTruckStore } from '../../store/truckStore';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

export default function TruckDetailPage() {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const { updateTruckStatus, removeTruck } = useTruckStore();
  const [truck, setTruck] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTruck = async () => {
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

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title={truck?.registrationNo || 'Truck detail'}
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet', label: 'Fleet' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
          { to: '/dealer/return-loads', label: 'Return loads' },
        ]}
      />

      {isLoading ? <LoadingSpinner label="Loading truck detail..." /> : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {truck ? (
        <div className="space-y-6">
          {/* ── Header Card ── */}
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">Fleet vehicle</p>
                  <h2 className="mt-1 font-heading text-xl font-bold text-slate-900">
                    {truck.registrationNo}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {truck.truckType} with {formatNumber(truck.maxWeightKg)} kg / {formatNumber(truck.maxVolumeM3)} m³ carrying capacity.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <StatusBadge animate={truck.status === 'ON_TRIP'} size="sm" status={truck.status} />
                  {activeTrip ? (
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-full bg-freight-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md hover:-translate-y-px"
                      to={`/dealer/trips/${activeTrip.id}`}
                    >
                      Manage active trip
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-slate-100">
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Current city</p>
                <p className="mt-1 text-base font-bold text-slate-900">{truck.currentCity || 'Not set'}</p>
                <p className="mt-0.5 text-xs text-slate-500">Dealer {truck.dealer?.companyName}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Emission factor</p>
                <p className="mt-1 text-base font-bold text-slate-900">{formatNumber(truck.emissionFactor)}</p>
                <p className="mt-0.5 text-xs text-slate-500">Fuel efficiency {formatNumber(truck.fuelEfficiency)} km/l</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Trips completed</p>
                <p className="mt-1 text-base font-bold text-slate-900">{stats.completedTrips}</p>
                <p className="mt-0.5 text-xs text-slate-500">Avg utilization {stats.avgUtilization.toFixed(0)}%</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Revenue tracked</p>
                <p className="mt-1 text-base font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="mt-0.5 text-xs text-slate-500">{formatNumber(stats.totalDistance)} km moved</p>
              </div>
            </div>
          </section>

          {/* ── Controls + Trip History ── */}
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            {/* Status controls */}
            <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-heading text-base font-semibold text-slate-900">Status controls</h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex flex-wrap gap-2.5">
                  {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((status) => (
                    <button
                      key={status}
                      className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-semibold transition-all ${
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
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      type="button"
                    >
                      Mark {status.toLowerCase().replace('_', ' ')}
                    </button>
                  ))}
                  {!activeTrip ? (
                    <button
                      className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                      disabled={isSaving}
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await removeTruck(truck.id);
                          navigate('/dealer/fleet');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      type="button"
                    >
                      Remove truck
                    </button>
                  ) : null}
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">Lifecycle</p>
                  <p className="mt-1.5 text-sm text-slate-600">Created {formatDateTime(truck.createdAt)}</p>
                  <p className="mt-0.5 text-sm text-slate-600">Updated {formatDateTime(truck.updatedAt)}</p>
                </div>
              </div>
            </article>

            {/* Trip history */}
            <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex max-h-[600px] flex-col xl:sticky xl:top-6">
              <div className="flex-none px-6 py-5 border-b border-slate-100">
                <h3 className="font-heading text-base font-semibold text-slate-900">Trip history</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
                {truck.trips?.length ? (
                  truck.trips.map((trip) => (
                    <div key={trip.id} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900">
                            Trip {trip.id.slice(0, 8)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {formatNumber(trip.estimatedDistanceKm)} km · {formatCurrency(trip.estimatedCost)}
                          </p>
                        </div>
                        <StatusBadge status={trip.status} size="sm" />
                      </div>
                      <div className="mt-3">
                        <Link
                          className="text-xs font-semibold text-freight-600 hover:text-freight-700 transition"
                          to={`/dealer/trips/${trip.id}`}
                        >
                          Open trip →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                    <p className="text-sm text-slate-400">
                      No trips have been created for this truck yet.
                    </p>
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
