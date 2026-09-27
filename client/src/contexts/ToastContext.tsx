import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Animated Toasts Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-red-950/90 text-white border-red-800 shadow-red-950/20'
                  : toast.type === 'info'
                  ? 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/30'
                  : 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/20'
              }`}
            >
              <div className="flex-shrink-0">
                {toast.type === 'error' ? (
                  <AlertCircle size={18} className="text-red-400" />
                ) : toast.type === 'info' ? (
                  <Info size={18} className="text-sky-400" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                )}
              </div>
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
