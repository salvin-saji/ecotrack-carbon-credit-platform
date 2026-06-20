import React from 'react';

export const TripStats = ({ tripDistance, tripTime, avgSpeed, totalCo2Saved, avgCo2, energyConsumption }) => {
  // Format seconds to hh:mm:ss
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  const statItems = [
    {
      label: 'ELAPSED TIME',
      value: formatTime(tripTime),
      unit: '',
      color: 'text-slate-800'
    },
    {
      label: 'TRIP DISTANCE',
      value: tripDistance.toFixed(2),
      unit: 'KM',
      color: 'text-sky-600'
    },
    {
      label: 'AVERAGE SPEED',
      value: avgSpeed.toFixed(1),
      unit: 'KM/H',
      color: 'text-slate-800'
    },
    {
      label: 'TOTAL CO₂ OFFSET',
      value: totalCo2Saved.toFixed(3),
      unit: 'KG',
      color: 'text-emerald-600'
    },
    {
      label: 'SESSION AVG CO₂',
      value: avgCo2.toFixed(1),
      unit: 'G/KM',
      color: 'text-slate-800'
    },
    {
      label: 'ENERGY EFFICIENCY',
      value: energyConsumption,
      unit: 'WH/KM',
      color: 'text-sky-600'
    }
  ];

  return (
    <div className="hud-card flex flex-col justify-between" style={{ minHeight: '340px' }}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
          <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">TRIP STATISTICS</span>
          <span className="font-mono text-[9px] text-slate-400">ACTIVE SESSION LOG</span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {statItems.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50 border border-slate-100 rounded p-2.5 flex flex-col justify-between min-h-[75px] hover:border-slate-200 transition-colors"
            >
              <span className="text-[8px] font-label text-slate-500 tracking-wider uppercase font-semibold">
                {item.label}
              </span>
              
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className={`text-xl font-display font-black leading-none ${item.color}`}>
                  {item.value}
                </span>
                {item.unit && (
                  <span className="text-[8px] font-display font-bold text-slate-400">
                    {item.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer details */}
      <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-slate-400 border-t border-slate-100 pt-2.5">
        <span>POWERTRAIN STATE: HYBRID AUTO</span>
        <span>GPS LOCK: ACTIVE</span>
      </div>
    </div>
  );
};
