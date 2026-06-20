import React from 'react';

export const TelemetryGraphs = ({ speedHistory, co2History }) => {
  const width = 300;
  const height = 80;

  // Max scale bounds
  const maxSpeedBound = 240;
  const maxCo2Bound = 300;

  // Utility to generate SVG path string and area fill path string
  const getSvgPaths = (history, maxValue) => {
    if (!history || history.length === 0) return { linePath: '', fillPath: '' };

    const len = history.length;
    // Map points to SVG coordinates (x: 0 to 300, y: height to 10)
    const points = history.map((val, idx) => {
      const x = (idx / (len - 1)) * width;
      // Keep a safety margin at the top (use height - 10 for mapping)
      const y = height - (val / maxValue) * (height - 15) - 5;
      return { x, y };
    });

    // Create straight line paths
    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const fillPath = `${linePath} L ${width.toFixed(1)} ${height.toFixed(1)} L 0 ${height.toFixed(1)} Z`;
    
    // Latest point coordinates for the pulsing dot
    const latestPoint = points[len - 1];

    return { linePath, fillPath, latestPoint };
  };

  const speedData = getSvgPaths(speedHistory, maxSpeedBound);
  const co2Data = getSvgPaths(co2History, maxCo2Bound);

  // Peak historical values in current buffer
  const maxSpeedCurrent = Math.max(...speedHistory, 0);
  const maxCo2Current = Math.max(...co2History, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Speed Graph Card */}
      <div className="hud-card flex flex-col justify-between" style={{ minHeight: '180px' }}>
        <div>
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
            <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">SPEED OVER TIME</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-slate-500">PEAK: {maxSpeedCurrent} km/h</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-blink"></span>
            </div>
          </div>

          {/* SVG Graph */}
          <div className="relative w-full h-[95px] mt-1 bg-slate-50 border border-slate-100 rounded p-1">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="speed-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(2, 132, 199, 0.15)" />
                  <stop offset="100%" stopColor="rgba(2, 132, 199, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              
              {/* Vertical Time dividers */}
              <line x1={width * 0.25} y1="0" x2={width * 0.25} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />
              <line x1={width * 0.5} y1="0" x2={width * 0.5} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />
              <line x1={width * 0.75} y1="0" x2={width * 0.75} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />

              {/* Area Fill */}
              {speedData.fillPath && (
                <path d={speedData.fillPath} fill="url(#speed-area-grad)" style={{ transition: 'd 0.1s linear' }} />
              )}

              {/* Curve Line */}
              {speedData.linePath && (
                <path
                  d={speedData.linePath}
                  fill="none"
                  stroke="var(--neon-cyan)"
                  strokeWidth="1.5"
                  style={{ transition: 'd 0.1s linear' }}
                />
              )}

              {/* End Point Indicator */}
              {speedData.latestPoint && (
                <g transform={`translate(${speedData.latestPoint.x}, ${speedData.latestPoint.y})`}>
                  <circle r="4.5" fill="var(--neon-cyan)" className="opacity-40 animate-blink" />
                  <circle r="2.5" fill="var(--neon-cyan)" />
                  <circle r="1" fill="#fff" />
                </g>
              )}
            </svg>
            
            {/* Axis labels */}
            <div className="absolute left-1 top-0.5 font-mono text-[7px] text-slate-400">240 km/h</div>
            <div className="absolute left-1 bottom-0.5 font-mono text-[7px] text-slate-400">0</div>
            <div className="absolute right-1 bottom-0.5 font-mono text-[7px] text-slate-400">REALTIME (30s)</div>
          </div>
        </div>
      </div>

      {/* CO2 Emissions Graph Card */}
      <div className="hud-card flex flex-col justify-between" style={{ minHeight: '180px' }}>
        <div>
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
            <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">CO₂ EMISSIONS HISTORY</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-slate-500">PEAK: {maxCo2Current} g/km</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-blink"></span>
            </div>
          </div>

          {/* SVG Graph */}
          <div className="relative w-full h-[95px] mt-1 bg-slate-50 border border-slate-100 rounded p-1">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="co2-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.15)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              
              {/* Vertical Time dividers */}
              <line x1={width * 0.25} y1="0" x2={width * 0.25} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />
              <line x1={width * 0.5} y1="0" x2={width * 0.5} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />
              <line x1={width * 0.75} y1="0" x2={width * 0.75} y2={height} stroke="rgba(0, 0, 0, 0.02)" strokeWidth="0.5" />

              {/* Area Fill */}
              {co2Data.fillPath && (
                <path d={co2Data.fillPath} fill="url(#co2-area-grad)" style={{ transition: 'd 0.1s linear' }} />
              )}

              {/* Curve Line */}
              {co2Data.linePath && (
                <path
                  d={co2Data.linePath}
                  fill="none"
                  stroke="var(--neon-red)"
                  strokeWidth="1.5"
                  style={{ transition: 'd 0.1s linear' }}
                />
              )}

              {/* End Point Indicator */}
              {co2Data.latestPoint && (
                <g transform={`translate(${co2Data.latestPoint.x}, ${co2Data.latestPoint.y})`}>
                  <circle r="4.5" fill="var(--neon-red)" className="opacity-40 animate-blink" />
                  <circle r="2.5" fill="var(--neon-red)" />
                  <circle r="1" fill="#fff" />
                </g>
              )}
            </svg>
            
            {/* Axis labels */}
            <div className="absolute left-1 top-0.5 font-mono text-[7px] text-slate-400">300 g/km</div>
            <div className="absolute left-1 bottom-0.5 font-mono text-[7px] text-slate-400">0</div>
            <div className="absolute right-1 bottom-0.5 font-mono text-[7px] text-slate-400">REALTIME (30s)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
