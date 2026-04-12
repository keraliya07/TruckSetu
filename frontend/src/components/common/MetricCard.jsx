import clsx from 'clsx';

export default function MetricCard({ label, value, hint, tone = 'text-freight-600', icon: Icon }) {
  return (
    <article className="panel-hover group p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        {Icon ? (
          <span className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
            tone === 'text-freight-600' && 'bg-gradient-to-br from-freight-500/10 to-freight-600/10 text-freight-600',
            tone === 'text-freight-600' && 'bg-gradient-to-br from-freight-500/10 to-freight-600/10 text-freight-600',
            tone === 'text-accent-600' && 'bg-gradient-to-br from-accent-500/10 to-accent-600/10 text-accent-600',
            tone === 'text-signal-600' && 'bg-gradient-to-br from-signal-500/10 to-signal-600/10 text-signal-600',
            tone === 'text-rose-600' && 'bg-gradient-to-br from-rose-500/10 to-rose-600/10 text-rose-600',
            !['text-freight-600', 'text-freight-600', 'text-accent-600', 'text-signal-600', 'text-rose-600'].includes(tone) && 'bg-slate-100 text-slate-500',
          )}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <p className={`mt-3 font-heading text-3xl ${tone}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}
