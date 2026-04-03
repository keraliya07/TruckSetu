import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect } from 'react';

import { useToastStore } from '../../store/toastStore';

const toneConfig = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  error: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-950',
    icon: TriangleAlert,
    iconClass: 'text-rose-600',
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: Info,
    iconClass: 'text-sky-600',
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

          return (
            <article
              key={toast.id}
              className={`pointer-events-auto rounded-3xl border px-4 py-4 shadow-lg backdrop-blur ${config.wrapper}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm opacity-85">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  className="rounded-full p-1 text-slate-500 transition hover:bg-white/60 hover:text-slate-900"
                  onClick={() => dismiss(toast.id)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
