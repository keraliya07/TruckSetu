import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../../components/common/ConfirmModal';
import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useTruckStore } from '../../store/truckStore';

export default function FleetPage() {
  const { user } = useAuth();
  const {
    trucks,
    filters,
    total,
    error,
    fetchTrucks,
    setFilter,
    updateTruckStatus,
    removeTruck,
  } = useTruckStore();
  const [removeId, setRemoveId] = useState(null);

  useEffect(() => {
    fetchTrucks(filters).catch(() => {});
  }, [filters.status, filters.limit, filters.page]);

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Dealer Flow"
      title={`${user?.truckDealer?.companyName || user?.name} fleet`}
      subtitle="Manage the trucks that are visible to the booking pipeline, keep availability current, and jump directly into truck detail or active trip management."
    >
      <PageTabs
        items={[
          { to: '/dealer/fleet/new', label: 'Add truck' },
          { to: '/dealer/bookings', label: 'Booking requests' },
          { to: '/dealer/analytics', label: 'Analytics' },
        ]}
      />

      <section className="panel p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:justify-end">
              <label className="w-full sm:w-56">
                <span className="field-label">Status</span>
                <select
                  className="input-base"
                  value={filters.status}
                  onChange={(event) => setFilter('status', event.target.value)}
                >
                  <option value="">All trucks</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On trip</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-3 sm:justify-end">
                <button className="btn-secondary" onClick={() => fetchTrucks(filters)} type="button">
                  Refresh
                </button>
                <Link className="btn-primary" to="/dealer/fleet/new">
                  Add truck
                </Link>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600">{total} truck(s) in this view</p>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {trucks.length === 0 ? (
        <EmptyState
          title="No trucks in fleet"
          description="Add your first vehicle to start receiving booking requests."
          action={
            <Link className="btn-primary" to="/dealer/fleet/new">
              Add first truck
            </Link>
          }
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {trucks.map((truck) => {
            const activeTrip = truck.trips?.find((trip) =>
              ['PLANNED', 'IN_TRANSIT'].includes(trip.status)
            );

            return (
              <article key={truck.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      className="font-heading text-2xl text-slate-950 hover:text-freight-700"
                      to={`/dealer/fleet/${truck.id}`}
                    >
                      {truck.registrationNo}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">{truck.truckType}</p>
                  </div>
                  <StatusBadge animate={truck.status === 'ON_TRIP'} size="md" status={truck.status} />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Capacity</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {truck.maxWeightKg} kg and {truck.maxVolumeM3} m3
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current city</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {truck.currentCity || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link className="btn-secondary" to={`/dealer/fleet/${truck.id}`}>
                    Open detail
                  </Link>
                  {activeTrip ? (
                    <Link className="btn-secondary" to={`/dealer/trips/${activeTrip.id}`}>
                      Active trip
                    </Link>
                  ) : null}
                  {truck.status !== 'AVAILABLE' ? (
                    <button
                      className="btn-secondary"
                      onClick={() => updateTruckStatus(truck.id, { status: 'AVAILABLE' })}
                      type="button"
                    >
                      Mark available
                    </button>
                  ) : null}
                  {truck.status !== 'MAINTENANCE' ? (
                    <button
                      className="btn-secondary"
                      onClick={() => updateTruckStatus(truck.id, { status: 'MAINTENANCE' })}
                      type="button"
                    >
                      Maintenance
                    </button>
                  ) : null}
                  {truck.status !== 'INACTIVE' ? (
                    <button
                      className="btn-secondary"
                      onClick={() => updateTruckStatus(truck.id, { status: 'INACTIVE' })}
                      type="button"
                    >
                      Deactivate
                    </button>
                  ) : null}
                  <button className="btn-secondary" onClick={() => setRemoveId(truck.id)} type="button">
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <ConfirmModal
        confirmText="Remove truck"
        isOpen={Boolean(removeId)}
        message="Removing a truck soft-disables it from the marketplace. Active trip protection still applies."
        onClose={() => setRemoveId(null)}
        onConfirm={async () => {
          await removeTruck(removeId);
          setRemoveId(null);
        }}
        title="Remove fleet vehicle"
      />
    </DashboardShell>
  );
}
