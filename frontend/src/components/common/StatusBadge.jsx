import clsx from 'clsx';

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  DRAFT: 'bg-slate-50 text-slate-600 border-slate-200/60',
  PENDING: 'bg-slate-50 text-slate-600 border-slate-200/60',
  PRE_APPROVED: 'bg-sky-50 text-sky-700 border-sky-200/60',
  OPTIMIZED: 'bg-sky-50 text-sky-700 border-sky-200/60',
  BOOKING_PENDING: 'bg-blue-50 text-blue-700 border-blue-200/60',
  BOOKING_CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200/60',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  COUNTERED: 'bg-amber-50 text-amber-700 border-amber-200/60',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/60',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200/60',
  LOADING: 'bg-amber-50 text-amber-800 border-amber-200/60',
  IN_TRANSIT: 'bg-amber-50 text-amber-800 border-amber-200/60',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  OPEN: 'bg-rose-50 text-rose-700 border-rose-200/60',
  IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200/60',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  ON_TRIP: 'bg-blue-50 text-blue-700 border-blue-200/60',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200/60',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200/60',
  SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200/60',
  DISABLED: 'bg-slate-100 text-slate-600 border-slate-200/60',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/60',
};

const dotGlow = {
  ACTIVE: 'shadow-emerald-400/50',
  BOOKING_CONFIRMED: 'shadow-emerald-400/50',
  APPROVED: 'shadow-emerald-400/50',
  DELIVERED: 'shadow-emerald-400/50',
  AVAILABLE: 'shadow-emerald-400/50',
  IN_TRANSIT: 'shadow-amber-400/50',
  LOADING: 'shadow-amber-400/50',
  BOOKING_PENDING: 'shadow-blue-400/50',
  ON_TRIP: 'shadow-blue-400/50',
  REJECTED: 'shadow-rose-400/50',
  EXPIRED: 'shadow-rose-400/50',
  CANCELLED: 'shadow-rose-400/50',
};

export default function StatusBadge({ status, size = 'sm', animate = false }) {
  const label = String(status || 'UNKNOWN').replaceAll('_', ' ');

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border font-semibold uppercase tracking-[0.16em] backdrop-blur-sm',
        size === 'md' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[10px]',
        statusStyles[status] || 'bg-slate-50 text-slate-600 border-slate-200/60'
      )}
    >
      <span
        className={clsx(
          'size-2 rounded-full bg-current',
          animate && 'animate-pulse shadow-sm',
          animate && (dotGlow[status] || '')
        )}
      />
      {label}
    </span>
  );
}
