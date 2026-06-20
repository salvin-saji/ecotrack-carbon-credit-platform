import React from 'react';
import { motion } from 'framer-motion';

export default function PasswordStrength({ password }) {
  const checkStrength = (p) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score;
  };

  const score = checkStrength(password);
  
  const getStrengthMeta = (s) => {
    switch(s) {
      case 0: return { label: 'None', color: 'bg-transparent', count: 0 };
      case 1: return { label: 'Very Weak', color: 'bg-red-500', count: 1 };
      case 2: return { label: 'Weak', color: 'bg-orange-500', count: 2 };
      case 3: return { label: 'Medium', color: 'bg-yellow-500', count: 3 };
      case 4: return { label: 'Strong', color: 'bg-emerald-500', count: 4 };
      case 5: return { label: 'Very Strong', color: 'bg-[#22c55e]', count: 5 };
      default: return { label: 'None', color: 'bg-transparent', count: 0 };
    }
  };

  const meta = getStrengthMeta(score);

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex items-center justify-between text-[10px] text-[#6b6b7a]">
        <span>PASSWORD STRENGTH</span>
        <span className="font-semibold text-white/80">{meta.label}</span>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-[#131316] rounded-full overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < meta.count ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              originX={0}
              className={`h-full ${meta.color}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
