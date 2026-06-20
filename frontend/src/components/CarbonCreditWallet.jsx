import React, { useState } from 'react';

export const CarbonCreditWallet = ({ carbonCredits, totalCo2Saved, walletLogs }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    }, 2000);
  };

  return (
    <div className="hud-card hud-card-eco flex flex-col justify-between" style={{ minHeight: '340px' }}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3 border-b border-slate-200/50 pb-2">
          <span className="font-label tracking-widest-cyber text-green text-xs font-bold">CARBON CREDITS WALLET</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-blink"></span>
            <span className="font-mono text-[8px] text-slate-400">VEHICLE NODE #47X9B</span>
          </div>
        </div>

        {/* Balance Card Section */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3.5 mb-3.5 relative overflow-hidden">
          <div className="text-[10px] font-label text-slate-400 tracking-widest uppercase mb-1">ACCUMULATED WALLET BALANCE</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-display font-black text-slate-800">
              {carbonCredits.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
            </span>
            <span className="text-xs font-display font-bold text-green">CCR</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3.5 border-t border-slate-200/60 pt-3">
            <div>
              <div className="text-[9px] font-label text-slate-400 tracking-wider font-semibold">NET CARBON OFFSET</div>
              <div className="font-mono text-xs text-slate-700 font-bold">
                {totalCo2Saved.toFixed(3)} kg
              </div>
            </div>
            <div>
              <div className="text-[9px] font-label text-slate-400 tracking-wider font-semibold">SMART CONTRACT STATUS</div>
              <div className="font-mono text-[10px] text-slate-700 flex items-center gap-1 font-bold">
                {isSyncing ? (
                  <span className="text-yellow animate-blink font-bold">SYNCING...</span>
                ) : syncDone ? (
                  <span className="text-emerald-600 font-bold">✓ UPTODATE</span>
                ) : (
                  <span className="text-slate-500">ONLINE // SECURED</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Activity */}
        <div className="mb-2">
          <div className="text-[9px] font-label text-slate-400 tracking-widest uppercase mb-1.5">REAL-TIME CARBON LEDGER</div>
          <div className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {walletLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded px-2 py-1 text-[10px] font-mono"
              >
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className={`w-1 h-1 rounded-full ${log.type === 'regen' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                  <span>{log.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green font-bold">{log.reward}</span>
                  <span className="text-[8px] text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <button 
        onClick={handleSync}
        className={`w-full cyber-btn cyber-btn-green mt-2 font-bold text-[10px] py-2 flex items-center justify-center gap-2 ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSyncing ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            COMMITTING BLOCKS...
          </span>
        ) : syncDone ? (
          <span>✓ NODE DEPLOYED SUCCESSFULLY</span>
        ) : (
          <span>SYNCHRONIZE CONTRACT NODE</span>
        )}
      </button>
    </div>
  );
};
