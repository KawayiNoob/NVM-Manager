interface AvailableVersionsErrorProps {
  error: string;
}

export function AvailableVersionsError({ error }: AvailableVersionsErrorProps) {
  return (
    <div className="text-center py-10 text-slate-500">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-red-500/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="mb-2 text-slate-300">{error}</p>
      <p className="text-xs text-slate-500">请检查网络连接后点击刷新按钮重试</p>
    </div>
  );
}
