import type { ToastMessage } from '@/types';

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg border text-sm transition-all duration-300 flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/40 text-slate-200'
              : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-slate-200'
                : 'bg-slate-800/95 border-white/10 text-slate-200'
          }`}
        >
          <span className="flex-1 whitespace-pre-line">{toast.message}</span>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded hover:bg-blue-500/30 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
