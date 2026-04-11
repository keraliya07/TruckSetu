import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect } from 'react';

import { useToastStore } from '../../store/toastStore';

const toneConfig = {
  success: {
    wrapper: 'border-emerald-200/60 bg-emerald-50/80 text-emerald-950',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    progress: 'bg-emerald-500',
  },
  error: {
    wrapper: 'border-rose-200/60 bg-rose-50/80 text-rose-950',
    icon: TriangleAlert,
    iconClass: 'text-rose-600',
    progress: 'bg-rose-500',
  },
  info: {
    wrapper: 'border-sky-200/60 bg-sky-50/80 text-sky-950',
    icon: Info,
    iconClass: 'text-sky-600',
    progress: 'bg-sky-500',
  },
};

export default function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), toast.duration || 3600)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismiss, toasts]);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <div className="flex w-full max-w-xl flex-col gap-3">
        {toasts.map((toast) => {
          const config = toneConfig[toast.tone] || toneConfig.info;
          const Icon = config.icon;
          const duration = toast.duration || 3600;

          return (
            <article
              key={toast.id}
              className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-lg backdrop-blur-xl animate-slide-down ${config.wrapper}`}
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/60 ${config.iconClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm opacity-80">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/60 hover:text-slate-900"
                  onClick={() => dismiss(toast.id)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Auto-dismiss progress bar */}
              <div className="h-0.5 w-full bg-black/5">
                <div
                  className={`h-full rounded-full opacity-50 animate-progress-shrink ${config.progress}`}
                  style={{ animationDuration: `${duration}ms` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
