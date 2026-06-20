import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[9px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase select-none">
          {label} {required && <span className="text-[#22c55e]">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#3a3a45] pointer-events-none transition-colors duration-200">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#131316] border rounded-xl px-3.5 py-2.5 text-[13px] text-[#f1f1f3] placeholder-[#3a3a45] transition-all duration-200 focus:outline-none 
            ${icon ? 'pl-10' : ''} 
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
              : 'border-[rgba(255,255,255,0.06)] focus:border-[#22c55e] focus:ring-4 focus:ring-[rgba(34,197,94,0.04)]'
            }`}
          {...props}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-red-500 mt-0.5 ml-1 font-medium overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
