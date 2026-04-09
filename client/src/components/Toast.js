import React, { useEffect } from 'react';

// Exact same toast UI from the original HTML
const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const tid = setTimeout(onDismiss, 4000);
    return () => clearTimeout(tid);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`toast${toast.type === 'success' ? ' success' : toast.type === 'error' ? ' error' : toast.type === 'info' ? ' info' : ''}`}
      onClick={onDismiss}
      style={{ cursor: 'pointer' }}
    >
      {toast.msg}
    </div>
  );
};

// Hook for toast state management
export function useToast() {
  const [toast, setToast] = React.useState(null);

  const showToast = React.useCallback((msg, type = 'info') => {
    setToast({ msg, type });
  }, []);

  const dismissToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, dismissToast };
}

export default Toast;