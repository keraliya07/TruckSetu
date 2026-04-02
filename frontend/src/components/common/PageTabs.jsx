import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function PageTabs({ items }) {
  return (
    <nav className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          key={item.to}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm font-semibold transition',
            item.active
              ? 'border-freight-600 bg-freight-600 text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
          )}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
