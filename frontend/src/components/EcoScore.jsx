import React from 'react';

export const EcoScore = ({ ecoScore }) => {
  const radius = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * radius;
  
  // Clean circular progress
  const scorePercentage = Math.min(1, Math.max(0, ecoScore / 100));
  const strokeDashoffset = circumference - (scorePercentage * circumference);

  // Dynamic colors and badges
  let scoreColor = 'var(--neon-green-glow)';
  let ratingLabel = 'OPTIMAL ECO';
  let badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-600';

  if (ecoScore < 50) {
    scoreColor = 'var(--neon-red)';
    ratingLabel = 'INEFFICIENT';
    badgeStyle = 'bg-red-50 border-red-200 text-red-500 animate-blink';
  } else if (ecoScore < 80) {
    scoreColor = 'var(--neon-cyan)';
    ratingLabel = 'NOMINAL';
    badgeStyle = 'bg-sky-50 border-sky-200 text-sky-600';
  }

  // Simulated sub-metrics derived from the overall eco score
  const throttleSmoothness = Math.round(Math.min(100, Math.max(10, ecoScore * 0.98 + (ecoScore > 80 ? 2 : -4))));
  const regenBraking = Math.round(Math.min(100, Math.max(10, ecoScore * 1.02 - (ecoScore < 50 ? 5 : 0))));
  const speedConsistency = Math.round(Math.min(100, Math.max(10, ecoScore * 0.95 + (ecoScore > 70 ? 3 : -3))));

  return (
    <div className="hud-card hud-card-eco flex flex-col justify-between" style={{ minHeight: '260px' }}>
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-2 border-b border-slate-100 pb-2">
        <span className="font-label tracking-widest-cyber text-green text-xs font-bold">ECO EFFICIENCY</span>
        <span className={`font-mono text-[9px] border rounded px-1.5 py-0.2 font-bold ${badgeStyle}`}>
          {ratingLabel}
        </span>
      </div>

      {/* Main score ring and numbers */}
      <div className="flex items-center justify-around gap-2 my-1">
        <div className="relative w-[120px] h-[120px]">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            {/* Back track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="8"
            />

            {/* Glowing progress arc */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.2s ease, stroke 0.2s ease',
              }}
            />
          </svg>

          {/* Central score digit overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-black text-slate-800 leading-none mt-1">
              {ecoScore}
            </span>
            <span className="text-[8px] font-label text-slate-400 tracking-wider">ECO INDEX</span>
          </div>
        </div>

        {/* Score sub-bars */}
        <div className="flex-1 flex flex-col gap-2 max-w-[140px]">
          {/* Throttle Smoothness */}
          <div>
            <div className="flex justify-between text-[10px] font-label font-medium mb-0.5">
              <span className="text-slate-500">THROTTLE CURVE</span>
              <span className="font-mono text-slate-700 font-bold">{throttleSmoothness}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
              <div 
                className="h-full bg-sky-500" 
                style={{ width: `${throttleSmoothness}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>

          {/* Regenerative Recovery */}
          <div>
            <div className="flex justify-between text-[10px] font-label font-medium mb-0.5">
              <span className="text-slate-500">REGEN HARVEST</span>
              <span className="font-mono text-slate-700 font-bold">{regenBraking}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${regenBraking}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>

          {/* Speed Consistency */}
          <div>
            <div className="flex justify-between text-[10px] font-label font-medium mb-0.5">
              <span className="text-slate-500">PACE STABILITY</span>
              <span className="font-mono text-slate-700 font-bold">{speedConsistency}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
              <div 
                className="h-full bg-amber-500" 
                style={{ width: `${speedConsistency}%`, transition: 'width 0.3s ease' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
