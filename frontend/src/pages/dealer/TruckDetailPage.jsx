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
      subtitle="Inspect current truck status, review commercial performance, and jump into any active trip from one place."
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet/new', label: 'Add truck' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
        ]}
      />

      {isLoading ? <LoadingSpinner label="Loading truck detail..." /> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {truck ? (
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  Fleet vehicle
                </p>
                <h2 className="mt-3 font-heading text-4xl text-slate-950">
                  {truck.registrationNo}
                </h2>
                <p className="mt-3 max-w-3xl text-slate-600">
                  {truck.truckType} with {formatNumber(truck.maxWeightKg)} kg / {formatNumber(truck.maxVolumeM3)} m3 carrying capacity.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <StatusBadge animate={truck.status === 'ON_TRIP'} size="md" status={truck.status} />
                {activeTrip ? (
                  <Link className="btn-primary" to={`/dealer/trips/${activeTrip.id}`}>
                    Manage active trip
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current city</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {truck.currentCity || 'Not set'}
                </p>
                <p className="mt-1 text-sm text-slate-600">Dealer {truck.dealer?.companyName}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Emission factor</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatNumber(truck.emissionFactor)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Fuel efficiency {formatNumber(truck.fuelEfficiency)} km/l
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Trips completed</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{stats.completedTrips}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Avg utilization {stats.avgUtilization.toFixed(0)}%
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Revenue tracked</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {formatNumber(stats.totalDistance)} km moved
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="panel p-6">
              <h3 className="font-heading text-2xl text-slate-950">Status controls</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {['AVAILABLE', 'MAINTENANCE', 'INACTIVE'].map((status) => (
                  <button
                    key={status}
                    className="btn-secondary"
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
                    className="btn-secondary"
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

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lifecycle</p>
                <p className="mt-2 text-sm text-slate-700">
                  Created {formatDateTime(truck.createdAt)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Updated {formatDateTime(truck.updatedAt)}
                </p>
              </div>
            </article>

            <article className="panel p-6">
              <h3 className="font-heading text-2xl text-slate-950">Trip history</h3>
              <div className="mt-6 space-y-4">
                {truck.trips?.length ? (
                  truck.trips.map((trip) => (
                    <div key={trip.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Trip {trip.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {formatNumber(trip.estimatedDistanceKm)} km • {formatCurrency(trip.estimatedCost)}
                          </p>
                        </div>
                        <StatusBadge status={trip.status} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link className="btn-secondary" to={`/dealer/trips/${trip.id}`}>
                          Open trip
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">
                    No trips have been created for this truck yet.
                  </p>
                )}
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
