import { useState, useCallback } from 'react';
import type { ToastMessage } from '@/types';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    action?: ToastMessage['action']
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, action }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const clearToastsByMessage = useCallback((messages: string[]) => {
    setToasts((prev) => prev.filter((t) => !messages.includes(t.message)));
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearToasts,
    clearToastsByMessage,
  };
};
