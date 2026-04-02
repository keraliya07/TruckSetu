export default function MetricCard({ label, value, hint, tone = 'text-freight-600' }) {
  return (
    <article className="panel p-5">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className={`mt-4 font-heading text-3xl ${tone}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-600">{hint}</p>
    </article>
  );
}
