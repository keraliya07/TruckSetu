const sizeMap = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

export default function LoadingSpinner({
  size = 'md',
  label,
  fullScreen = false,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <span
        className={`inline-block animate-spin rounded-full border-slate-200 border-t-freight-600 ${sizeMap[size] || sizeMap.md}`}
      />
      {label ? <p className="text-sm font-medium text-slate-600">{label}</p> : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 backdrop-blur-sm">
        <div className="panel w-full max-w-sm">{content}</div>
      </div>
    );
  }

  return content;
}
