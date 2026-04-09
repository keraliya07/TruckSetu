import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';

export default function BookingPage() {
  const { user } = useAuth();
  const { bookings, filters, error, fetchBookings, setFilter } = useBookingStore();

  useEffect(() => {
    fetchBookings(filters).catch(() => {});
  }, [filters.status, filters.limit, filters.page]);

  const metrics = useMemo(
    () => ({
      open: bookings.filter((booking) => booking.status === 'SENT').length,
      assigned: bookings.filter((booking) => booking.status === 'APPROVED').length,
      closed: bookings.filter((booking) =>
        ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(booking.status)
      ).length,
    }),
    [bookings]
  );

  return (
    <DashboardShell
      accent="text-brand-600"
      eyebrow="Warehouse Flow"
      title={`Shipment request board for ${user?.warehouse?.warehouseName || user?.name}`}
      subtitle="Track the requests sent automatically from shipment creation, monitor which dealers still have the request open, and see when one dealer accepts and the shipment gets assigned."
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/bookings', label: 'Bookings', active: true },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
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
                  <option value="">All requests</option>
                  <option value="SENT">Open invites</option>
                  <option value="APPROVED">Assigned</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Closed by assignment</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-3 sm:justify-end">
                <button className="btn-secondary" onClick={() => fetchBookings(filters)} type="button">
                  Refresh
                </button>
                <Link className="btn-primary" to="/warehouse/shipments/new">
                  Create shipment
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open invites</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.open}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.assigned}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Closed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{metrics.closed}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {bookings.length === 0 ? (
        <EmptyState
          title="No shipment requests yet"
          description="Create a shipment and the platform will automatically price it and send it to the top optimized dealers."
          action={
            <Link className="btn-primary" to="/warehouse/shipments/new">
              Create shipment
            </Link>
          }
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    className="font-heading text-2xl text-slate-950 hover:text-freight-700"
                    to={`/warehouse/bookings/${booking.id}`}
                  >
                    {booking.shipments[0]?.shipment?.title || booking.id.slice(0, 8)}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600">
                    Dealer {booking.truck?.dealer?.companyName} via truck {booking.truck?.registrationNo}
                  </p>
                </div>
                <StatusBadge animate={booking.status === 'SENT'} size="md" status={booking.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quoted price</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Rs {booking.quotedPrice}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Expires</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : 'No expiry'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                {booking.shipments.map((entry) => (
                  <p key={entry.shipment.id}>
                    {entry.shipment.originCity} to {entry.shipment.destCity} | {entry.shipment.weightKg} kg | {entry.shipment.shipmentType}
                  </p>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn-secondary" to={`/warehouse/bookings/${booking.id}`}>
                  Open detail
                </Link>
                {booking.status === 'APPROVED' && booking.trip ? (
                  <Link className="btn-secondary" to={`/warehouse/tracking/${booking.trip.id}`}>
                    Track trip
                  </Link>
                ) : null}
              </div>

              {booking.status === 'CANCELLED' ? (
                <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  This invite closed automatically after another dealer accepted the shipment.
                </div>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </DashboardShell>
  );
}
