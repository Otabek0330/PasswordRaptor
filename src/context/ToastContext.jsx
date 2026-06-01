import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 2800) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 400); // extra time for exit animation
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Internal — rendered inside provider
function ToastContainer({ toasts, dismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      className={`toast toast--${toast.type}`}
      role="status"
      onClick={onDismiss}
      title="Click to dismiss"
    >
      <span className="toast__icon">
        {toast.type === 'success' && '✓'}
        {toast.type === 'error'   && '✗'}
        {toast.type === 'info'    && 'i'}
        {toast.type === 'warning' && '!'}
      </span>
      <span className="toast__message">{toast.message}</span>
      <div
        className="toast__progress"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}
