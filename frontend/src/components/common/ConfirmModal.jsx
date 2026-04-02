import clsx from 'clsx';

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

  const confirmStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-freight-600 hover:bg-freight-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="panel w-full max-w-md p-6">
        <h3 className="font-heading text-2xl text-slate-950">{title}</h3>
        <p className="mt-3 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="btn-secondary" onClick={onClose} type="button">
            {cancelText}
          </button>
          <button
            className={clsx(
              'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition',
              confirmStyles[variant] || confirmStyles.info
            )}
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
          >
            {isLoading ? 'Working...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
