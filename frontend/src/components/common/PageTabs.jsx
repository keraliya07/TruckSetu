import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

export default function PageTabs({ items }) {
  const { pathname } = useLocation();

  if (pathname.startsWith('/warehouse') || pathname.startsWith('/dealer')) {
    return null;
  }

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.to}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200',
            item.active
              ? 'border-freight-600 bg-gradient-to-r from-freight-600 to-freight-500 text-white shadow-md shadow-freight-600/20'
              : 'border-slate-200/60 bg-white/70 text-slate-600 backdrop-blur hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm'
          )}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
