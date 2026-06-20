import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastNotification({
  message,
  type = 'error', // 'error' | 'success' | 'info'
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const styles = {
    error: {
      bg: 'bg-[#180f11]/90',
      border: 'border-red-500/25',
      text: 'text-red-400',
      icon: (
        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    success: {
      bg: 'bg-[#0f1913]/90',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      icon: (
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: {
      bg: 'bg-[#0f141c]/90',
      border: 'border-blue-500/25',
      text: 'text-blue-400',
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentStyle = styles[type] || styles.error;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl max-w-sm ${currentStyle.bg} ${currentStyle.border}`}
        >
          {currentStyle.icon}
          <div className="flex-1">
            <p className={`text-[12px] font-medium leading-relaxed ${currentStyle.text}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white/60 transition-colors p-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
