import React, { useEffect } from 'react';
import { useToast, type Toast } from './useToast';


const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const { removeToast } = useToast();

    useEffect(() => {
        const timeout = toast.timeout || 5000;
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, timeout);

        return () => clearTimeout(timer);
    }, [toast.id, toast.timeout, removeToast]);

    const alertClass = `alert alert-${toast.type}`;

    return (
        <div className={alertClass}>
            <div>
                {toast.title && <div className="font-bold">{toast.title}</div>}
                <span>{toast.description}</span>
            </div>
            <button
                className="btn btn-sm btn-ghost"
                onClick={() => removeToast(toast.id)}
            >
                ✕
            </button>
        </div>
    );
};

export const Toaster: React.FC = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast toast-top toast-end">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};