import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastType } from '../types';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const success = useCallback((message: string) => toast(message, 'success'), [toast]);
  const error = useCallback((message: string) => toast(message, 'error'), [toast]);
  const info = useCallback((message: string) => toast(message, 'info'), [toast]);

  const iconFor = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} />;
      case 'error': return <AlertTriangle size={18} />;
      default: return <Info size={18} />;
    }
  };

  const colorFor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'error': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  const iconColorFor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)]" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-start justify-between gap-3 border rounded-xl shadow-lg px-4 py-3 animate-in slide-in-from-top-4 fade-in duration-300 ${colorFor(t.type)}`}>
            <div className="flex items-start gap-2.5">
              <span className={`mt-0.5 flex-shrink-0 ${iconColorFor(t.type)}`}>{iconFor(t.type)}</span>
              <p className="text-sm font-medium leading-snug">{t.message}</p>
            </div>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Fechar" className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de um ToastProvider');
  return context;
};
