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
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="relative">
        <span
          className={`inline-block animate-spin rounded-full border-slate-200 border-t-freight-500 ${sizeMap[size] || sizeMap.md}`}
        />
        <span
          className={`absolute inset-0 animate-spin rounded-full border-transparent border-b-accent-400/30 ${sizeMap[size] || sizeMap.md}`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      {label ? <p className="text-sm font-medium text-slate-500">{label}</p> : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm animate-fade-in">
        <div className="panel w-full max-w-sm animate-scale-in">{content}</div>
      </div>
    );
  }

  return content;
}
