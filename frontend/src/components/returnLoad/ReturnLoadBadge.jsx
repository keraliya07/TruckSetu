import { ArrowRightLeft } from 'lucide-react';

export default function ReturnLoadBadge({ matchCount, onClick }) {
  if (!matchCount) {
    return null;
  }

  return (
    <button
      className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
      onClick={onClick}
      type="button"
    >
      <span className="rounded-full bg-white/90 p-2 text-emerald-700">
        <ArrowRightLeft className="h-4 w-4" />
      </span>
      {matchCount} return load{matchCount === 1 ? '' : 's'} available
    </button>
  );
}
