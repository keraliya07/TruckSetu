import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

import * as bookingApi from '../../api/booking.api';
import LoadingSpinner from '../common/LoadingSpinner';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';
import { formatCurrency, formatDateTime, formatNumber } from '../../utils/formatters';

export default function BookingDetailPane({ bookingId, onUpdate, onClose }) {
  const { isDealer } = useAuth();
  const { respondToBooking } = useBookingStore();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealerNote, setDealerNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadBooking = async () => {
    if (!bookingId) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingApi.getBookingById(bookingId);
      setBooking(result);
      setDealerNote(result.dealerNote || '');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooking().catch(() => {});
  }, [bookingId]);

  const trip = booking?.trip || null;
  const totalWeight = useMemo(
    () =>
      booking?.shipments?.reduce(
        (sum, entry) => sum + Number(entry.shipment?.weightKg || 0),
        0
      ) || 0,
    [booking?.shipments]
  );
  const primaryShipment = booking?.shipments?.[0]?.shipment || null;

  if (isLoading) return <div className="p-6"><LoadingSpinner label="Loading details..." /></div>;
  if (error) return <div className="p-6"><div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div></div>;
  if (!booking) return <div className="p-6 text-slate-500">Select a booking to view details</div>;

  return (
    <article className="flex h-full flex-col relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">

      {/* Pane Header */}
      <div className="flex-none border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Booking Detail</p>
            <h2 className="mt-1 font-heading text-xl font-bold text-slate-900 truncate">
              {booking.truck?.registrationNo || 'No truck assigned'}
            </h2>
          </div>
          {onClose && (
            <button 
              className="rounded-lg bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
           <StatusBadge animate={booking.status === 'SENT'} size="sm" status={booking.status} />
           <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/20">
             {booking.shipments.length} shipment(s)
           </span>
           <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-500/20">
             Total load {formatNumber(totalWeight)} kg
           </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 pb-8 custom-scrollbar">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-3">Lifecycle</p>
          <p className="text-sm text-slate-500">
            Requested {formatDateTime(booking.createdAt)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Quoted</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(booking.quotedPrice)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-400">Final</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {booking.finalPrice ? formatCurrency(booking.finalPrice) : 'Awaiting'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-400 mb-3">Shipments</p>
          <div className="space-y-3">
            {booking.shipments.map((entry) => (
              <div key={entry.shipment.id} className="rounded-xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition">
                 <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-slate-900">{entry.shipment.title || entry.shipment.referenceNo}</p>
                    <StatusBadge status={entry.shipment.status} />
                 </div>
                 <p className="mt-1 text-xs text-slate-500">{entry.shipment.originCity} to {entry.shipment.destCity}</p>
                 <p className="mt-2 text-xs text-slate-600">{formatNumber(entry.shipment.weightKg)} kg | {entry.shipment.shipmentType}</p>
                 {!isDealer && (
                    <Link className="text-xs text-brand-600 hover:text-brand-700 font-bold mt-2 inline-block uppercase tracking-wider" to={`/warehouse/shipments/${entry.shipment.id}`}>
                      Open shipment →
                    </Link>
                 )}
              </div>
            ))}
          </div>
        </div>

        <div>
           <p className="text-xs font-medium text-slate-400 mb-3">Response</p>
           {booking.status === 'CANCELLED' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                This request was closed because another dealer accepted the shipment first.
              </div>
            ) : null}

            {booking.status === 'REJECTED' ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                The dealer rejected this request. The shipment stays open for the other invited dealers unless another request closes first.
              </div>
            ) : null}

            {trip ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mt-3">
                <p className="font-semibold text-emerald-950">Trip {trip.id.slice(0, 8)} active</p>
                <div className="mt-2">
                  <Link className="text-xs uppercase tracking-wider font-bold text-emerald-700 hover:text-emerald-800" to={isDealer ? `/dealer/trips/${trip.id}` : `/warehouse/tracking/${trip.id}`}>
                    Open trip →
                  </Link>
                </div>
              </div>
            ) : null}

            {isDealer && booking.status === 'SENT' ? (
              <div className="mt-4 grid gap-3">
                 <textarea
                  className="input-base text-sm min-h-20"
                  placeholder="Optional note to warehouse..."
                  value={dealerNote}
                  onChange={(event) => setDealerNote(event.target.value)}
                />
                <button
                  className="btn-primary w-full py-2 text-sm"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await respondToBooking(booking.id, { action: 'APPROVE', dealerNote });
                      await loadBooking();
                      if (onUpdate) onUpdate();
                    } finally { setIsSaving(false); }
                  }}
                  type="button"
                >Accept</button>
                <button
                  className="btn-secondary w-full py-2 text-sm"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await respondToBooking(booking.id, { action: 'REJECT', dealerNote });
                      await loadBooking();
                      if (onUpdate) onUpdate();
                    } finally { setIsSaving(false); }
                  }}
                  type="button"
                >Reject</button>
              </div>
            ) : null}
        </div>
      </div>
    </article>
  );
}
