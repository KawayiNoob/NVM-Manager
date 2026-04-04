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
          className={`px-6 py-3 rounded-lg border text-sm transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/40 text-slate-200'
              : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/40 text-slate-200'
                : 'bg-slate-800/95 border-white/10 text-slate-200'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
