import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, DollarSign, Package } from 'lucide-react';

import * as shipmentApi from '../../api/shipment.api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

export default function ShipmentDetailPane({ shipmentId, onClose }) {
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    if (!shipmentId) {
      setShipment(null);
      return;
    }

    const loadShipment = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await shipmentApi.getShipmentById(shipmentId);
        if (active) setShipment(result);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load shipment details');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadShipment().catch(() => {});

    return () => {
      active = false;
    };
  }, [shipmentId]);

  if (!shipmentId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          title="Select a shipment"
          description="Click on any shipment from the board to view its full details, dealer requests, and live trip status."
          icon={Package}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingSpinner label="Loading shipment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  if (!shipment) return null;

  const bookingRequests = (shipment.bookingShipments || [])
    .map((entry) => entry.bookingRequest)
    .filter(Boolean);

  const approvedBooking = bookingRequests.find((booking) => booking.status === 'APPROVED') || null;
  const activeTrip = approvedBooking?.trip || shipment.tripShipments?.[0]?.trip || null;

  return (
    <article className="flex h-full flex-col relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">

      {/* ── Pane Header ── */}
      <div className="flex-none border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">{shipment.referenceNo}</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 truncate">
              {shipment.title || shipment.referenceNo}
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
          <StatusBadge
            animate={['BOOKING_PENDING', 'IN_TRANSIT', 'LOADING'].includes(shipment.status)}
            size="sm"
            status={shipment.status}
          />
          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
            {shipment.shipmentType}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/20">
            Priority {shipment.priority}
          </span>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="relative flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-8 custom-scrollbar">

        {/* Stats Row — single compact strip */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Weight</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatNumber(shipment.weightKg)} <span className="text-sm font-medium text-slate-400">kg</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Volume</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatNumber(shipment.volumeM3)} <span className="text-sm font-medium text-slate-400">m³</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Pickup by</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(shipment.pickupDeadline)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Deliver by</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(shipment.deadline)}</p>
          </div>
        </section>

        {/* Price */}
        <div className="flex items-center justify-between rounded-xl bg-brand-50/50 border border-brand-100 p-4">
          <div>
            <p className="text-xs font-medium text-brand-600">Price</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {shipment.systemPrice ? formatCurrency(shipment.systemPrice) : 'Unquoted'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <DollarSign className="h-5 w-5 text-brand-600" />
          </div>
        </div>

        {/* Route — compact inline */}
        <section>
          <p className="text-xs font-medium text-slate-400 mb-3">Route</p>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative mb-4">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
                <p className="text-sm font-semibold text-slate-900">{shipment.originCity}</p>
                {shipment.originAddress && (
                  <p className="text-xs text-slate-400 mt-0.5">{shipment.originAddress}</p>
                )}
              </div>
              <div className="relative">
                <div className="absolute -left-[18px] top-0.5 h-2.5 w-2.5 rounded-full bg-slate-800 ring-2 ring-white" />
                <p className="text-sm font-semibold text-slate-900">{shipment.destCity}</p>
                {shipment.destAddress && (
                  <p className="text-xs text-slate-400 mt-0.5">{shipment.destAddress}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Dealer Bids */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-400">Dealer bids</p>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{bookingRequests.length}</span>
          </div>

          <div className="space-y-2.5">
            {bookingRequests.length ? (
              bookingRequests.map((booking) => (
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
                    <Link className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition" to={`/warehouse/bookings/${booking.id}`}>
                      View bid →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center">
                <p className="text-sm text-slate-400">No dealer bids yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Live Trip */}
        <section>
          <p className="text-xs font-medium text-slate-400 mb-3">Trip status</p>
          {activeTrip ? (
            <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px shadow-md shadow-emerald-500/15">
              <div className="rounded-[11px] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-600">Active trip</p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-slate-900">{activeTrip.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                  </div>
                </div>
                <Link
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
                  to={`/warehouse/tracking/${activeTrip.id}`}
                >
                  Track shipment
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm text-slate-400">No active trip — awaiting dealer confirmation</p>
            </div>
          )}
        </section>

      </div>
    </article>
  );
}
