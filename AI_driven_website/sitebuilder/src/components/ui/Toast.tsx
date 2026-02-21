'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

const DOT_COLORS: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-purple-500',
};

const BORDER_COLORS: Record<ToastType, string> = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-purple-500/30',
};

function ToastNotification({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 bg-[#1a1a1a] border ${BORDER_COLORS[toast.type]} rounded-lg px-4 py-3 shadow-xl transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
        >
            <div className={`w-2 h-2 rounded-full ${DOT_COLORS[toast.type]} shrink-0`} />
            <span className="text-sm text-white">{toast.message}</span>
        </div>
    );
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <ToastNotification
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
