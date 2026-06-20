import React from 'react';

export const CO2Gauge = ({ co2 }) => {
  const maxCo2 = 2.0; // g/s max limit for visual sweep
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  
  // Sweep arc: 270 degrees
  const arcLength = circumference * 0.75;
  const co2Percentage = Math.min(1, Math.max(0, co2 / maxCo2));
  const strokeDashoffset = arcLength - (co2Percentage * arcLength);
  const needleAngle = -135 + co2Percentage * 270;

  // Decide colors: sky blue normal, red above 1.0
  const gaugeColor = co2 > 1.0 ? '#ef4444' : '#38bdf8';
  const trackColor = '#18181b'; // zinc-900
  const tickInactiveColor = '#27272a'; // zinc-800

  // Ticks every 0.2 g/s
  const ticks = [];
  for (let i = 0; i <= maxCo2; i += 0.2) {
    const angle = -135 + (i / maxCo2) * 270;
    const isMajor = Math.abs((i * 10) % 4) < 0.1; // major ticks every 0.4
    const length = isMajor ? 8 : 4;
    const color = i <= co2 ? gaugeColor : tickInactiveColor;
    
    const rad = (angle - 90) * (Math.PI / 180);
    const x1 = cx + (radius - 2) * Math.cos(rad);
    const y1 = cy + (radius - 2) * Math.sin(rad);
    const x2 = cx + (radius - 2 - length) * Math.cos(rad);
    const y2 = cy + (radius - 2 - length) * Math.sin(rad);

    let tx, ty;
    if (isMajor) {
      tx = cx + (radius - 15) * Math.cos(rad);
      ty = cy + (radius - 15) * Math.sin(rad) + 2.5;
    }

    ticks.push(
      <g key={i}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={isMajor ? 1.5 : 1}
          style={{ transition: 'stroke 0.15s ease' }}
        />
        {isMajor && (
          <text
            x={tx}
            y={ty}
            fill={i <= co2 ? '#e4e4e7' : '#52525b'}
            fontSize="6"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
            style={{ transition: 'fill 0.15s ease' }}
          >
            {i.toFixed(1)}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
      <div className="flex justify-between items-center w-full mb-3 border-b border-zinc-850 pb-2">
        <span className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase">CO₂ EMISSION RATE</span>
        <span className="font-mono text-[9px] text-zinc-500">ECO LIMIT: 0.50 g/s</span>
      </div>

      <div className="relative w-[190px] h-[190px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background track */}
          <path
            d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57"
            fill="none"
            stroke={trackColor}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active arc */}
          <path
            d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="6"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.15s ease-out, stroke 0.2s ease',
              transformOrigin: 'center'
            }}
          />

          {/* Ticks */}
          {ticks}

          {/* Needle */}
          <g transform={`rotate(${needleAngle} ${cx} ${cy})`} style={{ transition: 'transform 0.15s ease-out' }}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 14}
              stroke={gaugeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="3" fill={gaugeColor} />
          </g>
        </svg>

        {/* Text readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '8px' }}>
          <div className="text-3xl font-display font-black text-white leading-none mt-3">
            {co2.toFixed(3)}
          </div>
          <div className="text-[9px] font-mono text-zinc-400 tracking-widest mt-1.5">G/S CO₂</div>
        </div>
      </div>
    </div>
  );
};
