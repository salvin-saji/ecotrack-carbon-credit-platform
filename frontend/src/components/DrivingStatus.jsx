import React from 'react';

export const DrivingStatus = ({ gear, battery, temp, tirePressures, gForce, driveMode }) => {
  // G-Force chart parameters
  const gridSize = 70;
  const halfGrid = gridSize / 2;
  const maxG = 1.5;
  const gDotX = halfGrid + (gForce.x / maxG) * halfGrid;
  const gDotY = halfGrid - (gForce.y / maxG) * halfGrid; // invert Y for screen coords

  const gearOptions = ['P', 'R', 'N', 'D', 'S'];
  const activeGearBase = gear.charAt(0); // get letter: P, R, N, D, S

  return (
    <div className="hud-card flex flex-col justify-between" style={{ minHeight: '340px' }}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
          <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">VEHICLE DIAGNOSTICS</span>
          <span className="font-mono text-[9px] text-slate-400">CHASSIS: v2.10</span>
        </div>

        {/* Transmission Select HUD */}
        <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded p-2 mb-3.5">
          {gearOptions.map((g) => {
            const isActive = activeGearBase === g;
            let activeClass = '';
            if (isActive) {
              if (g === 'S') activeClass = 'bg-red-50 border-red-200 text-red-500 font-bold';
              else if (g === 'P') activeClass = 'bg-slate-100 border-slate-300 text-slate-500 font-bold';
              else activeClass = 'bg-sky-50 border-sky-200 text-sky-600 font-bold';
            }
            return (
              <span
                key={g}
                className={`font-display text-xs px-2.5 py-0.5 border rounded-sm transition-all duration-200 ${
                  isActive ? activeClass : 'border-transparent text-slate-400'
                }`}
              >
                {g === gear.charAt(0) ? gear : g}
              </span>
            );
          })}
        </div>

        {/* G-Force HUD & Tyre Pressures Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* SVG G-Force Ball Meter */}
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded p-2 text-center">
            <span className="text-[8px] font-label text-slate-400 tracking-wider uppercase mb-1">G-FORCE METER</span>
            
            <div className="relative w-[70px] h-[70px]">
              <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="w-full h-full">
                {/* Concentric G circles */}
                <circle cx={halfGrid} cy={halfGrid} r={halfGrid - 2} fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                <circle cx={halfGrid} cy={halfGrid} r={halfGrid * 0.6} fill="none" stroke="rgba(2, 132, 199, 0.06)" strokeWidth="1" strokeDasharray="2,2" />
                
                {/* Crosshairs */}
                <line x1="0" y1={halfGrid} x2={gridSize} y2={halfGrid} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                <line x1={halfGrid} y1="0" x2={halfGrid} y2={gridSize} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />

                {/* Dot */}
                <circle 
                  cx={gDotX} 
                  cy={gDotY} 
                  r="3.5" 
                  fill={driveMode === 'track' ? 'var(--neon-red)' : 'var(--neon-cyan)'} 
                  style={{ transition: 'cx 0.1s ease-out, cy 0.1s ease-out' }}
                />
              </svg>
            </div>
            
            <div className="flex justify-between w-full mt-1.5 px-1 font-mono text-[9px] text-slate-500">
              <span>LAT: {gForce.x.toFixed(2)}G</span>
              <span>LON: {gForce.y.toFixed(2)}G</span>
            </div>
          </div>

          {/* Tire Pressures */}
          <div className="flex flex-col justify-between bg-slate-50 border border-slate-100 rounded p-2.5 relative">
            <span className="text-[8px] font-label text-slate-400 tracking-wider uppercase mb-1.5 text-center">TIRE PRESSURES (PSI)</span>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] text-center font-bold">
              <div>
                <div className="text-[7px] text-slate-400">FL</div>
                <div className="text-sky-600">{tirePressures[0]}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-400">FR</div>
                <div className="text-sky-600">{tirePressures[1]}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-400">RL</div>
                <div className="text-sky-600">{tirePressures[2]}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-400">RR</div>
                <div className="text-sky-600">{tirePressures[3]}</div>
              </div>
            </div>

            <div className="text-[8px] text-emerald-600 font-bold font-label text-center mt-2.5 tracking-wide">
              TYRES NOMINAL
            </div>
          </div>
        </div>
      </div>

      {/* Battery State of charge & Coolant Temp */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
        <div>
          <div className="flex justify-between text-[10px] font-label mb-1">
            <span className="text-slate-500 font-medium">BATTERY SOC</span>
            <span className="font-mono text-slate-700 font-bold">{battery}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-emerald-500"
              style={{ width: `${battery}%`, transition: 'width 0.2s linear' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-label mb-1">
            <span className="text-slate-500 font-medium">COOLANT TEMP</span>
            <span className={`font-mono font-bold ${temp > 100 ? 'text-red animate-blink' : 'text-slate-700'}`}>{temp}°C</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className={`h-full ${temp > 100 ? 'bg-red-500' : 'bg-sky-500'}`}
              style={{ width: `${Math.min(100, ((temp - 50) / 80) * 100)}%`, transition: 'width 0.2s linear' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
