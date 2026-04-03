import clsx from 'clsx';

const statusStyles = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-slate-100 text-slate-700',
  PRE_APPROVED: 'bg-sky-100 text-sky-700',
  OPTIMIZED: 'bg-sky-100 text-sky-700',
  BOOKING_PENDING: 'bg-blue-100 text-blue-700',
  BOOKING_CONFIRMED: 'bg-emerald-100 text-emerald-700',
  SENT: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  COUNTERED: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  EXPIRED: 'bg-rose-100 text-rose-700',
  LOADING: 'bg-amber-100 text-amber-800',
  IN_TRANSIT: 'bg-amber-100 text-amber-800',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  OPEN: 'bg-rose-100 text-rose-700',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  AVAILABLE: 'bg-emerald-100 text-emerald-700',
  ON_TRIP: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  INACTIVE: 'bg-slate-200 text-slate-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  DISABLED: 'bg-slate-200 text-slate-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

export default function StatusBadge({ status, size = 'sm', animate = false }) {
  const label = String(status || 'UNKNOWN').replaceAll('_', ' ');

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 rounded-full font-semibold uppercase tracking-[0.16em]',
        size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[10px]',
        statusStyles[status] || 'bg-slate-100 text-slate-700'
      )}
    >
      <span
        className={clsx(
          'size-1.5 rounded-full bg-current',
          animate ? 'animate-pulse' : ''
        )}
      />
      {label}
    </span>
  );
}
