import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

function ToastCard({ toast, onDismiss }) {
  const typeClass =
    toast.type === 'ERROR'
      ? 'border-tertiary/60'
      : toast.type === 'SUCCESS'
        ? 'border-secondary/60'
        : 'border-primary/60';

  return (
    <div
      className={`retro-toast-panel border ${typeClass} ${toast.exiting ? 'retro-toast-panel-exit' : 'retro-toast-panel-enter'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs tracking-widest text-primary">{toast.type}</div>
          <div className="text-sm text-gray-100 font-bold mt-1">{toast.title}</div>
          {toast.description && <div className="text-xs text-gray-300 mt-1 leading-relaxed">{toast.description}</div>}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-white transition-colors text-xs mt-1"
          aria-label="Dismiss notification"
        >
          X
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismiss(id) {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }

  function push(type, title, description = '', duration = 3500) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nextToast = { id, type, title, description, exiting: false };
    setToasts((prev) => [nextToast, ...prev].slice(0, 4));
    setTimeout(() => dismiss(id), duration);
  }

  const value = useMemo(
    () => ({
      success: (title, description, duration) => push('SUCCESS', title, description, duration),
      error: (title, description, duration) => push('ERROR', title, description, duration),
      info: (title, description, duration) => push('INFO', title, description, duration),
      dismiss,
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-24 right-4 z-[70] flex justify-end sm:right-6">
        <div className="w-[min(92vw,28rem)] space-y-3 pointer-events-auto">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
