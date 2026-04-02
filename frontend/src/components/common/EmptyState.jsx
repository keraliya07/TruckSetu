import { PackageSearch } from 'lucide-react';

export default function EmptyState({
  title,
  description,
  action,
  icon: Icon = PackageSearch,
}) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-full bg-slate-100 p-4 text-slate-500">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-5 font-heading text-2xl text-slate-950">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
