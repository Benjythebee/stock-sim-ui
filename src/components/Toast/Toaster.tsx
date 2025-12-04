import React, { useEffect } from 'react';
import { useToast, type Toast } from './useToast';
import { cn } from '../../utils/cn';


const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const { removeToast } = useToast();

    useEffect(() => {
        const timeout = toast.timeout || 5000;
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, timeout);

        return () => clearTimeout(timer);
    }, [toast.id, toast.timeout, removeToast]);


    return (
        <div className={cn(`alert`,{
            'alert-info': toast.type === 'info',
            'alert-success': toast.type === 'success',
            'alert-warning': toast.type === 'warning',
            'alert-error': toast.type === 'error',
        })}>
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

    // if (toasts.length === 0) return null;

    return (
        <div className="toast toast-bottom toast-end">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};