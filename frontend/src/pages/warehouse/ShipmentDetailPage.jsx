import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import * as optimizationApi from '../../api/optimization.api';
import * as shipmentApi from '../../api/shipment.api';
import DashboardShell from '../../components/common/DashboardShell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTabs from '../../components/common/PageTabs';
import StatusBadge from '../../components/common/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../../utils/formatters';

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShipment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await shipmentApi.getShipmentById(id);
        setShipment(result);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadShipment().catch(() => {});
  }, [id]);

  const bookingRequests = useMemo(
    () =>
      (shipment?.bookingShipments || [])
        .map((entry) => entry.bookingRequest)
        .filter(Boolean),
    [shipment?.bookingShipments]
  );
  const approvedBooking = useMemo(
    () => bookingRequests.find((booking) => booking.status === 'APPROVED') || null,
    [bookingRequests]
  );
  const activeTrip = useMemo(
    () => approvedBooking?.trip || shipment?.tripShipments?.[0]?.trip || null,
    [approvedBooking?.trip, shipment?.tripShipments]
  );

  const handleScoreTrucks = async () => {
    setIsScoring(true);
    setError(null);
    try {
      await optimizationApi.scoreTrucks({ shipmentIds: [shipment.id] });
      // Reload shipment to get updated bookings/matches if it creates them behind the scenes
      const result = await shipmentApi.getShipmentById(id);
      setShipment(result);
    } catch (err) {
      setError(err.message || 'Failed to score trucks');
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <DashboardShell
      accent="text-freight-600"
      eyebrow="Warehouse Flow"
      title={shipment?.title || shipment?.referenceNo || 'Shipment detail'}
    >
      <PageTabs
        items={[
          { to: '/warehouse/shipments', label: 'Shipment board' },
          { to: '/warehouse/shipments/history', label: 'Shipment history' },
          { to: '/warehouse/shipments/new', label: 'Create workspace' },
          { to: '/warehouse/bookings', label: 'Bookings' },
          { to: '/warehouse/truck-estimation', label: 'Truck estimation' },
        ]}
      />

      {isLoading ? <LoadingSpinner label="Loading shipment detail..." /> : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {shipment ? (
        <div className="space-y-6">
          {/* ── Header Card ── */}
          <section className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">{shipment.referenceNo}</p>
                  <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 truncate">
                    {shipment.title || shipment.referenceNo}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">
                    {shipment.description || 'No shipment description added yet.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <StatusBadge
                    animate={['BOOKING_PENDING', 'IN_TRANSIT', 'LOADING'].includes(shipment.status)}
                    size="sm"
                    status={shipment.status}
                  />
                  {shipment.status === 'PENDING' ? (
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md hover:-translate-y-px disabled:opacity-70 disabled:hover:translate-y-0"
                      disabled={isScoring}
                      onClick={handleScoreTrucks}
                      type="button"
                    >
                      {isScoring ? 'Scoring...' : 'Score Trucks (ML)'}
                    </button>
                  ) : null}
                  {activeTrip ? (
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md hover:-translate-y-px"
                      to={`/warehouse/tracking/${activeTrip.id}`}
                    >
                      Track live →
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Vital stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-slate-100">
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Load</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{formatNumber(shipment.weightKg)} <span className="text-sm font-medium text-slate-400">kg</span></p>
                <p className="mt-0.5 text-xs text-slate-500">{formatNumber(shipment.volumeM3)} m³ vol</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Timing</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Pickup {formatDateTime(shipment.pickupDeadline)}</p>
                <p className="mt-0.5 text-xs text-slate-500">Delivery {formatDate(shipment.deadline)}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-slate-400">Shipment Type</p>
                <p className="mt-1 text-base font-bold text-slate-900">{shipment.shipmentType}</p>
                <p className="mt-0.5 text-xs text-slate-500">Priority {shipment.priority}</p>
              </div>
              <div className="bg-white px-5 py-4">
                <p className="text-xs font-medium text-freight-600">System Price</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {shipment.systemPrice ? formatCurrency(shipment.systemPrice) : 'Not available'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {shipment.estimatedDistanceKm ? `${shipment.estimatedDistanceKm} km` : 'Distance N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* ── Lane + Dealer grid ── */}
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Lane breakdown */}
            <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-400">Navigational Lane</p>
                <h3 className="mt-1 font-heading text-base font-semibold text-slate-900">Lane breakdown</h3>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                  <div className="relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    <div className="relative mb-5">
                      <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-full bg-freight-500 ring-2 ring-white" />
                      <p className="text-xs font-medium text-slate-400">Origin</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">{shipment.originCity}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{shipment.originAddress || 'Pickup address pending'}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-full bg-slate-800 ring-2 ring-white" />
                      <p className="text-xs font-medium text-slate-400">Destination</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">{shipment.destCity}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{shipment.destAddress || 'Delivery address pending'}</p>
                    </div>
                  </div>
                </div>

                {shipment.specialInstructions && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3">
                    <p className="text-xs font-medium text-amber-600">Special Instructions</p>
                    <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{shipment.specialInstructions}</p>
                  </div>
                )}
              </div>
            </article>

            {/* Dealer requests + trip state */}
            <article className="space-y-6">
              {/* Dealer request board */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
                <div className="flex-none px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Dealer Actions</p>
                      <h3 className="mt-1 font-heading text-base font-semibold text-slate-900">Request board</h3>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 tabular-nums">
                      {bookingRequests.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                  {bookingRequests.length ? (
                    <div className="space-y-2.5">
                      {bookingRequests.map((booking) => (
                        <div key={booking.id} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-900 truncate">{booking.truck?.dealer?.companyName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">Truck {booking.truck?.registrationNo}</p>
                            </div>
                            <StatusBadge status={booking.status} size="sm" />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">{formatCurrency(booking.quotedPrice)}</p>
                            <Link className="text-xs font-semibold text-freight-600 hover:text-freight-700 transition" to={`/warehouse/bookings/${booking.id}`}>
                              View request →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                      <p className="text-sm text-slate-400">No dealer requests have been created yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip state */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-400">Live Execution</p>
                  <h3 className="mt-1 font-heading text-base font-semibold text-slate-900">Trip state</h3>
                </div>
                <div className="p-5">
                  {activeTrip ? (
                    <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px shadow-md shadow-emerald-500/15">
                      <div className="rounded-[11px] bg-white p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-emerald-600">Active trip</p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-slate-900">{activeTrip.id.slice(0, 8)}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Started {formatDateTime(activeTrip.startedAt)}</p>
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                          </div>
                        </div>
                        <Link
                          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
                          to={`/warehouse/tracking/${activeTrip.id}`}
                        >
                          Open live tracking →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                      <p className="text-sm text-slate-400">
                        A trip will appear here once one dealer accepts the shipment request.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
}
