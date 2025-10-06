
import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

const toastConfig = {
    success: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
    error: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', border: 'border-red-500' },
    info: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
};

// Toast component to be rendered inside ToastContainer
const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onRemove]);
    
    const config = toastConfig[toast.type];

    return (
      <div className={`flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow ${config.bg} ${config.text} border-l-4 ${config.border}`} role="alert">
        <div className="ml-3 text-sm font-medium">{toast.message}</div>
        <button type="button" onClick={() => onRemove(toast.id)} className="ml-auto -mx-1.5 -my-1.5 bg-transparent rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close">
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>
    );
  };
  
const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-xs">
        {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
    </div>
);

export default ToastContainer;