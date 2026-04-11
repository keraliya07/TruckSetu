import clsx from 'clsx';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

import { createPortal } from 'react-dom';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  if (!isOpen) {
    return null;
  }

  const styles = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-rose-100 text-rose-600',
      iconBorder: 'border-rose-50',
      glow: 'bg-rose-500/20 blur-[32px]',
      button: 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-600/30 hover:-translate-y-[1px]',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600',
      iconBorder: 'border-amber-50',
      glow: 'bg-amber-500/20 blur-[32px]',
      button: 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/30 hover:-translate-y-[1px]',
    },
    info: {
      icon: Info,
      iconBg: 'bg-indigo-100 text-indigo-600',
      iconBorder: 'border-indigo-50',
      glow: 'bg-indigo-500/20 blur-[32px]',
      button: 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/30 hover:-translate-y-[1px]',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100 text-emerald-600',
      iconBorder: 'border-emerald-50',
      glow: 'bg-emerald-500/20 blur-[32px]',
      button: 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30 hover:-translate-y-[1px]',
    },
  };

  const currentStyle = styles[variant] || styles.info;
  const Icon = currentStyle.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-[24rem] animate-scale-in">
        
        {/* Modal Outer Aura */}
        <div className="absolute inset-0 -top-8 scale-90 opacity-100 mix-blend-multiply flex justify-center pointer-events-none">
          <div className={`h-40 w-40 rounded-full ${currentStyle.glow}`} />
        </div>
        
        {/* Main Card Surface */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-900/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
            
            {/* Themed Icon Anchor */}
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] border-[3px] ${currentStyle.iconBorder} ${currentStyle.iconBg}`}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
            </div>

            {/* Typography */}
            <h3 className="font-heading text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
            <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-500">{message}</p>

            {/* Decisive Stacked Actions */}
            <div className="mt-10 flex w-full flex-col gap-3">
              <button
                className={clsx(
                  'inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[15px] font-bold text-white transition-all duration-300 shadow-md',
                  currentStyle.button,
                  isLoading ? 'pointer-events-none opacity-90' : ''
                )}
                disabled={isLoading}
                onClick={onConfirm}
                type="button"
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white/80" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
              <button 
                className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-[15px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100" 
                onClick={onClose} 
                type="button"
              >
                {cancelText}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
