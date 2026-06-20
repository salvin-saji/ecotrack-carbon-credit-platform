import React, { useState, useEffect, useRef } from 'react';

export const CreditWallet = ({ credits }) => {
  const [changeState, setChangeState] = useState(null); // 'up', 'down', or null
  const [diff, setDiff] = useState(0);
  const prevCreditsRef = useRef(credits);

  // Stats summaries
  const [dailyEarned, setDailyEarned] = useState(12.45);
  const [dailyLost, setDailyLost] = useState(2.80);

  useEffect(() => {
    const prev = prevCreditsRef.current;
    if (credits !== prev) {
      const difference = credits - prev;
      setDiff(Math.abs(difference));
      
      if (difference > 0) {
        setChangeState('up');
        setDailyEarned(d => d + difference);
      } else if (difference < 0) {
        setChangeState('down');
        setDailyLost(d => d + Math.abs(difference));
      }
      
      prevCreditsRef.current = credits;
      
      const timer = setTimeout(() => {
        setChangeState(null);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [credits]);

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium flex flex-col justify-between min-h-[260px] relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3 border-b border-zinc-850 pb-2">
          <span className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase">CARBON WALLET</span>
          <span className="font-mono text-[9px] text-zinc-500">SMART WALLET</span>
        </div>

        {/* Balance Display with color flash notifications */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          changeState === 'up'
            ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
            : changeState === 'down'
            ? 'bg-red-950/20 border-red-900/50 text-red-400'
            : 'bg-zinc-900/60 border border-zinc-850'
        }`}>
          <div className="text-[10px] font-display text-zinc-500 tracking-widest uppercase mb-1">AVAILABLE BALANCE</div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-display font-black text-white tracking-tight">
                {credits.toFixed(2)}
              </span>
              <span className="text-xs font-display font-bold text-emerald-400">CCR</span>
            </div>
            
            {/* Flash Indicator */}
            {changeState && (
              <div className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                changeState === 'up' 
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40' 
                  : 'text-red-400 bg-red-950/40 border-red-900/40'
              }`}>
                <span>{changeState === 'up' ? '▲' : '▼'}</span>
                <span>{diff.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily summaries */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-lg p-2.5">
          <div className="text-[8px] font-display text-zinc-500 tracking-wider uppercase font-semibold">TODAY'S HARVEST</div>
          <div className="text-sm font-mono text-emerald-400 font-bold mt-1">+{dailyEarned.toFixed(2)} CCR</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-lg p-2.5">
          <div className="text-[8px] font-display text-zinc-500 tracking-wider uppercase font-semibold">TODAY'S CONSUMED</div>
          <div className="text-sm font-mono text-red-400 font-bold mt-1">-{dailyLost.toFixed(2)} CCR</div>
        </div>
      </div>
    </div>
  );
};
