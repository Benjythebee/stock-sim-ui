import { create } from 'zustand';




export interface Toast {
    id: string;
    title?: string;
    description?: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timeout?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToast = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) =>
        set((state) => ({
            toasts: [
                ...state.toasts,
                { ...toast, id: Math.random().toString(36).substr(2, 9) },
            ],
        })),
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
    clearAll: () => set({ toasts: [] }),
}));