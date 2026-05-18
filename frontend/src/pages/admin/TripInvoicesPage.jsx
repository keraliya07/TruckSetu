import { useEffect, useState } from 'react';

import * as tripApi from '../../api/trip.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceDownloadButton from '../../components/trips/InvoiceDownloadButton';
import DashboardShell from '../../components/common/DashboardShell';
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

const statusOptions = [
  { value: '', label: 'All trips' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function TripInvoicesPage() {
  const [status, setStatus] = useState('');
  const [tripState, setTripState] = useState({
    trips: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setTripState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));

      try {
        const result = await tripApi.getTrips({
          limit: 100,
          status: status || undefined,
        });

        if (cancelled) {
          return;
        }

        setTripState({
          trips: result.trips || [],
          total: result.total || 0,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTripState({
          trips: [],
          total: 0,
          isLoading: false,
          error: error.message || 'Failed to load trips',
        });
      }
    }

    loadTrips().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [status]);

  return (
    <DashboardShell
      accent="text-signal-600"
      eyebrow="Admin Control"
      title="Trip invoices"
      subtitle="Download commercial invoice PDFs for any trip across the platform."
    >
      <section className="rounded-3xl border border-slate-100 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {tripState.total} invoice-ready trip{tripState.total === 1 ? '' : 's'}
            </p>
            <h2 className="mt-2 font-heading text-2xl text-slate-950">
              Finance document center
            </h2>
          </div>
          <select
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-freight-500 focus:ring-2 focus:ring-freight-500/20"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            {statusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {tripState.isLoading ? <LoadingSpinner label="Loading trip invoices..." /> : null}

      {tripState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {tripState.error}
        </div>
      ) : null}

      {!tripState.isLoading && !tripState.trips.length ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center text-slate-500">
          No trips matched this invoice filter.
        </div>
      ) : null}

      {tripState.trips.length ? (
        <section className="grid gap-4">
          {tripState.trips.map((trip) => {
            const shipmentCount = trip.shipments?.length || 0;
            const warehouseName = trip.bookingRequest?.warehouse?.warehouseName || 'No warehouse';
            const dealerName = trip.dealer?.companyName || trip.truck?.dealer?.companyName || 'No dealer';

            return (
              <article
                className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                key={trip.id}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading text-xl text-slate-950">
                        Trip {trip.id.slice(0, 8)}
                      </h3>
                      <StatusBadge size="sm" status={trip.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {warehouseName} with {dealerName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Truck {trip.truck?.registrationNo || 'N/A'} | {shipmentCount} shipment
                      {shipmentCount === 1 ? '' : 's'} | {formatNumber(trip.estimatedDistanceKm)} km
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <p className="font-semibold text-slate-950">
                        {formatCurrency(trip.actualCost || trip.estimatedCost)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Created {formatDateTime(trip.createdAt)}
                      </p>
                    </div>
                    <InvoiceDownloadButton
                      className="btn-primary gap-2"
                      tripId={trip.id}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </DashboardShell>
  );
}
