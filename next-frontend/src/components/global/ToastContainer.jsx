"use client";
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] border-zk-border shadow-[2px_2px_0_0_rgba(0,0,0,1)] min-w-[280px] ${
              toast.type === 'success' ? 'bg-[#00C853] text-white' :
              toast.type === 'error' ? 'bg-[#FF4B4B] text-white' :
              toast.type === 'orange' ? 'bg-zk-coral text-white' :
              'bg-zk-panel-bg text-zk-text'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} className={toast.type === 'orange' ? 'text-white' : undefined} />
            )}
            <p className="font-bold text-sm tracking-tight flex-1">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="hover:rotate-90 transition-transform"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
