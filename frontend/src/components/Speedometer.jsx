import React from 'react';

export const Speedometer = ({ speed }) => {
  const maxSpeed = 120;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  
  // Sweep arc: 270 degrees
  const arcLength = circumference * 0.75;
  const speedPercentage = Math.min(1, Math.max(0, speed / maxSpeed));
  const strokeDashoffset = arcLength - (speedPercentage * arcLength);
  const needleAngle = -135 + speedPercentage * 270;

  // Decide colors: elegant white/silver, red warning above 90
  const speedColor = speed > 90 ? '#ef4444' : '#e4e4e7';
  const trackColor = '#18181b'; // zinc-900
  const tickInactiveColor = '#27272a'; // zinc-800

  // Ticks every 10 km/h
  const ticks = [];
  for (let i = 0; i <= maxSpeed; i += 10) {
    const angle = -135 + (i / maxSpeed) * 270;
    const isMajor = i % 20 === 0;
    const length = isMajor ? 8 : 4;
    const color = i <= speed ? speedColor : tickInactiveColor;
    
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
            fill={i <= speed ? '#e4e4e7' : '#52525b'}
            fontSize="6"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
            style={{ transition: 'fill 0.15s ease' }}
          >
            {i}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
      <div className="flex justify-between items-center w-full mb-3 border-b border-zinc-850 pb-2">
        <span className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase">SPEEDOMETER</span>
        <span className="font-mono text-[9px] text-zinc-500">LIMIT: 120 km/h</span>
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

          {/* Active speed arc */}
          <path
            d="M 43.43 156.57 A 80 80 0 1 1 156.57 156.57"
            fill="none"
            stroke={speedColor}
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
              stroke={speedColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="3" fill={speedColor} />
          </g>
        </svg>

        {/* Speed text reading overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '8px' }}>
          <div className="text-4xl font-display font-black text-white leading-none mt-3">
            {Math.round(speed)}
          </div>
          <div className="text-[9px] font-mono text-zinc-400 tracking-widest mt-1">KM/H</div>
        </div>
      </div>
    </div>
  );
};
