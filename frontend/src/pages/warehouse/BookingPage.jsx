import { useDeferredValue, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DashboardShell from '../../components/common/DashboardShell';
import EmptyState from '../../components/common/EmptyState';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import BookingDetailPane from '../../components/shared/BookingDetailPane';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';
import { formatCurrency } from '../../utils/formatters';

export default function BookingPage() {
  const { user } = useAuth();
  const { bookings, filters, error, fetchBookings, setFilter } = useBookingStore();
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (filters.limit !== 1000) {
      setFilter('limit', 1000);
    }
  }, [filters.limit, setFilter]);

  useEffect(() => {
    fetchBookings(filters).catch(() => {});
  }, [filters.status, filters.limit, filters.page]);

  /* Client-side search filtering */
  const filtered = bookings.filter((booking) => {
    if (!deferredSearch) return true;
    const q = deferredSearch.toLowerCase();
    const title = booking.shipments[0]?.shipment?.title || '';
    const dealer = booking.truck?.dealer?.companyName || '';
    const truck = booking.truck?.registrationNo || '';
    const id = booking.id || '';
    return (
      title.toLowerCase().includes(q) ||
      dealer.toLowerCase().includes(q) ||
      truck.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title={`Booking board for ${user?.warehouse?.warehouseName || user?.name}`}
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings', active: true },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      {/* ── Toolbar ── */}
      <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Top row: title + count + CTA */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">Bookings</h2>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
              {bookings.length}
            </span>
          </div>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full bg-freight-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-freight-700 hover:shadow-md hover:-translate-y-px"
            to="/warehouse/shipments/new"
          >
            + New shipment
          </Link>
        </div>

        {/* Bottom row: search + filter + refresh */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center px-5 py-3 bg-slate-50/50">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 bg-white placeholder:text-slate-400 focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10"
              placeholder="Search bookings..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="w-full sm:w-44 rounded-lg border border-slate-200 py-2 px-3 text-sm text-slate-700 outline-none transition-all duration-200 bg-white focus:border-freight-500 focus:ring-2 focus:ring-freight-500/10"
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

          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 shrink-0"
            onClick={() => fetchBookings(filters)}
            type="button"
            title="Refresh"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No booking requests found"
          description="Create a shipment and the platform will automatically price it and send it to the top optimized dealers."
          action={
            <Link className="btn-primary" to="/warehouse/shipments/new">
              Create shipment
            </Link>
          }
        />
      ) : (
        <section
          className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            selectedBookingId
              ? 'grid gap-6 xl:grid-cols-[1.4fr_0.9fr] xl:items-start'
              : 'mx-auto max-w-4xl'
          }`}
        >
          {/* ── Compact card list ── */}
          <div className="space-y-2.5">
            {filtered.map((booking, index) => (
              <button
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                type="button"
                className={`group w-full text-left relative overflow-hidden rounded-2xl border transition-all duration-250 px-5 py-5 block animate-fade-in ${
                  selectedBookingId === booking.id
                    ? 'border-freight-200 bg-freight-50/30 shadow-sm ring-1 ring-freight-100'
                    : 'border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)]'
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Core info — compact two-line layout */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className={`font-heading text-base font-semibold truncate transition ${
                        selectedBookingId === booking.id ? 'text-freight-900' : 'text-slate-900 group-hover:text-freight-700'
                      }`}>
                        {booking.shipments[0]?.shipment?.title || `Request ${booking.id.slice(0, 8)}`}
                      </p>
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 truncate">
                      {booking.truck?.dealer?.companyName || 'Unassigned'}
                      <span className="text-slate-200 mx-1.5">·</span>
                      <span className="text-slate-400">{booking.truck?.registrationNo || '—'}</span>
                      <span className="text-slate-200 mx-1.5">·</span>
                      <span className="text-slate-400">{formatCurrency(booking.quotedPrice)}</span>
                      <span className="text-slate-200 mx-1.5">·</span>
                      <span className="text-slate-400">{booking.shipments.length} shipment{booking.shipments.length !== 1 ? 's' : ''}</span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      animate={booking.status === 'SENT'}
                      size="sm"
                      status={booking.status}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail Pane */}
          {selectedBookingId && (
            <div className="xl:sticky xl:top-3 flex h-[calc(100vh-1.5rem)] max-h-[1200px] flex-col animate-slide-up">
              <BookingDetailPane
                bookingId={selectedBookingId}
                onClose={() => setSelectedBookingId(null)}
                onUpdate={() => fetchBookings(filters)}
              />
            </div>
          )}
        </section>
      )}
    </DashboardShell>
  );
}
