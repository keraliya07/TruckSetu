import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  title,
  description,
  action,
  icon: Icon = PackageSearch,
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300/60 bg-white/40 flex flex-col items-center justify-center px-6 py-20 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-md animate-fade-in transition-all duration-300 hover:bg-white/60">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-freight-500/20 to-accent-500/20 blur-xl" />
        <div className="relative rounded-[2rem] bg-white/80 border border-slate-100 p-6 text-slate-400 shadow-sm shadow-slate-200/50 backdrop-blur-md animate-float flex items-center justify-center">
          <Icon className="size-10 text-slate-400" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-8 font-heading text-2xl font-medium bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
