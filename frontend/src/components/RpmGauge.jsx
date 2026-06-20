import React from 'react';

export const RpmGauge = ({ rpm }) => {
  const maxRpm = 8000;
  const redlineRpm = 6200;
  const radius = 80;
  const cx = 100;
  const cy = 105; // Slightly lower center for a flatter semi-circle look
  const circumference = 2 * Math.PI * radius;
  
  // Sweep angle: 220 degrees (starts at 200 deg, sweeps to -20 deg)
  const arcSweep = 220;
  const startAngle = 200;
  const rpmPercentage = Math.min(1, rpm / maxRpm);
  
  const arcLength = circumference * (arcSweep / 360);
  const strokeDashoffset = arcLength - (rpmPercentage * arcLength);

  const isRedline = rpm >= redlineRpm;

  // Decide current progress color based on RPM range
  let rpmColor = 'var(--neon-cyan)';
  if (rpm >= redlineRpm) {
    rpmColor = 'var(--neon-red)';
  } else if (rpm >= 5000) {
    rpmColor = 'var(--neon-yellow)';
  }

  // Generate tick marks (every 500 RPM)
  const ticks = [];
  for (let i = 0; i <= maxRpm; i += 500) {
    const angle = startAngle - (i / maxRpm) * arcSweep;
    const isMajor = i % 1000 === 0;
    const length = isMajor ? 8 : 4;
    
    // Tick color: Redline area is red, others base colored
    let tickColor = '#e2e8f0';
    if (i >= redlineRpm) {
      tickColor = i <= rpm ? 'var(--neon-red)' : '#fee2e2';
    } else {
      tickColor = i <= rpm ? rpmColor : '#e2e8f0';
    }

    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = cx + (radius - 2) * Math.cos(rad);
    const y1 = cy + (radius - 2) * Math.sin(rad);
    const x2 = cx + (radius - 2 - length) * Math.cos(rad);
    const y2 = cy + (radius - 2 - length) * Math.sin(rad);

    let tx, ty;
    if (isMajor) {
      tx = cx + (radius - 16) * Math.cos(rad);
      ty = cy + (radius - 16) * Math.sin(rad) + 2;
    }

    ticks.push(
      <g key={i}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={tickColor}
          strokeWidth={isMajor ? 1.5 : 1}
          style={{ transition: 'stroke 0.15s ease' }}
        />
        {isMajor && (
          <text
            x={tx}
            y={ty}
            fill={i <= rpm ? (i >= redlineRpm ? 'var(--neon-red)' : '#1e293b') : '#94a3b8'}
            fontSize="7"
            fontFamily="var(--font-display)"
            fontWeight="600"
            textAnchor="middle"
            style={{ transition: 'fill 0.15s ease' }}
          >
            {i / 1000}
          </text>
        )}
      </g>
    );
  }

  // Calculate coordinates for redline background band (from redline to maxRpm)
  const redlinePercentageStart = redlineRpm / maxRpm;
  const redlineArcOffset = arcLength * (1 - redlinePercentageStart);

  return (
    <div className="hud-card flex flex-col items-center justify-center" style={{ minHeight: '260px' }}>
      {/* HUD Header Bar */}
      <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">TACHOMETER</span>
          {isRedline && (
            <span className="bg-red-50 border border-red-200 text-red-500 font-mono text-[8px] px-1 rounded animate-blink">
              REDLINE
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-slate-400">RPM x1000</span>
      </div>

      <div className="relative w-[210px] h-[210px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background Arc Track */}
          <path
            d={`M ${cx + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - 90) * Math.PI / 180)} 
                A ${radius} ${radius} 0 1 1 ${cx + radius * Math.cos((startAngle - arcSweep - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - arcSweep - 90) * Math.PI / 180)}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="8"
          />

          {/* Redline static zone background arc */}
          <path
            d={`M ${cx + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - 90) * Math.PI / 180)} 
                A ${radius} ${radius} 0 1 1 ${cx + radius * Math.cos((startAngle - arcSweep - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - arcSweep - 90) * Math.PI / 180)}`}
            fill="none"
            stroke="#fee2e2"
            strokeWidth="8"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength - redlineArcOffset}
            transform={`rotate(${arcSweep * redlinePercentageStart} ${cx} ${cy})`}
            style={{ transformOrigin: 'center' }}
          />

          {/* Ticks */}
          {ticks}

          {/* Active RPM sweep arc */}
          <path
            d={`M ${cx + radius * Math.cos((startAngle - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - 90) * Math.PI / 180)} 
                A ${radius} ${radius} 0 1 1 ${cx + radius * Math.cos((startAngle - arcSweep - 90) * Math.PI / 180)} ${cy + radius * Math.sin((startAngle - arcSweep - 90) * Math.PI / 180)}`}
            fill="none"
            stroke={rpmColor}
            strokeWidth="5"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s linear, stroke 0.15s ease',
              transformOrigin: 'center'
            }}
          />

          {/* Core circle */}
          <circle cx={cx} cy={cy} r="40" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1" />
        </svg>

        {/* Central numerical display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '12px' }}>
          <div className={`text-3xl font-display font-black leading-none ${isRedline ? 'text-red' : 'text-slate-800'}`} style={{ transition: 'color 0.15s ease' }}>
            {rpm}
          </div>
          <div className="text-[9px] font-label tracking-widest text-slate-400 font-bold mt-1">RPM</div>
          
          <div className="w-[60px] h-[3px] bg-slate-100 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full ${isRedline ? 'bg-red-500' : 'bg-sky-500'}`} 
              style={{ 
                width: `${rpmPercentage * 100}%`,
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
