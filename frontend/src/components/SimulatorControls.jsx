import React from 'react';

export const SimulatorControls = ({
  throttle, setThrottle,
  brake, setBrake,
  driveMode, setDriveMode,
  regenLevel, setRegenLevel,
  isAutopilot, setIsAutopilot
}) => {
  const modes = [
    { id: 'eco', label: 'ECO' },
    { id: 'comfort', label: 'COMFORT' },
    { id: 'sport', label: 'SPORT' },
    { id: 'track', label: 'TRACK' }
  ];

  return (
    <div className="hud-card flex flex-col justify-between" style={{ minHeight: '260px' }}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-3 border-b border-slate-100 pb-2">
          <span className="font-label tracking-widest-cyber text-cyan text-xs font-bold">HUD PILOT PANEL</span>
          <span className="font-mono text-[9px] text-slate-400">VEHICLE CONTROLS</span>
        </div>

        {/* Autopilot toggle */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded p-3.5 mb-3.5">
          <div>
            <div className="text-[10px] font-label text-slate-700 font-bold uppercase tracking-wider">AP AUTOPILOT DEPLOYMENT</div>
            <div className="text-[8.5px] font-mono text-slate-500">Autonomous route telemetry simulation</div>
          </div>
          <button
            onClick={() => {
              setIsAutopilot(!isAutopilot);
              // reset inputs
              setThrottle(0);
              setBrake(0);
            }}
            className={`cyber-btn font-bold text-[9px] px-4 py-1.5 ${isAutopilot ? 'cyber-btn-green' : 'cyber-btn-red text-white'}`}
          >
            {isAutopilot ? 'AP ENGAGED' : 'AP STANDBY'}
          </button>
        </div>

        {/* Sliders & Toggles (Manual Mode Only) */}
        {isAutopilot ? (
          <div className="flex flex-col items-center justify-center bg-emerald-50/50 border border-emerald-100 rounded p-4 text-center h-[120px]">
            <div className="text-emerald-600 animate-blink font-display text-sm font-bold tracking-widest uppercase mb-1">
              AUTOPILOT CO-PILOT ACTIVE
            </div>
            <p className="text-[9.5px] font-mono text-slate-500 max-w-[280px] font-medium">
              The vehicle is driving on a simulated eco-driving route. Disengage Autopilot to take full manual control.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 h-[120px]">
            {/* Throttle */}
            <div className="bg-slate-50 border border-slate-100 rounded p-2.5 flex flex-col justify-between">
              <div className="flex justify-between text-[9px] font-label text-slate-500 font-bold">
                <span>THROTTLE PEDAL</span>
                <span className="font-mono text-sky-600">{throttle}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={throttle}
                onChange={(e) => {
                  setThrottle(parseInt(e.target.value));
                  if (parseInt(e.target.value) > 0) setBrake(0);
                }}
                className="w-full accent-sky-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none my-2"
              />
              <div className="flex gap-1.5">
                <button
                  onMouseDown={() => { setThrottle(100); setBrake(0); }}
                  onMouseUp={() => setThrottle(0)}
                  onTouchStart={() => { setThrottle(100); setBrake(0); }}
                  onTouchEnd={() => setThrottle(0)}
                  className="flex-1 bg-sky-50 border border-sky-200 text-sky-600 text-[8px] py-1 rounded hover:bg-sky-100 font-mono font-bold active:scale-95 transition-all"
                >
                  FULL GAS
                </button>
              </div>
            </div>

            {/* Brake */}
            <div className="bg-slate-50 border border-slate-100 rounded p-2.5 flex flex-col justify-between">
              <div className="flex justify-between text-[9px] font-label text-slate-500 font-bold">
                <span>BRAKE PEDAL</span>
                <span className="font-mono text-red-500">{brake}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brake}
                onChange={(e) => {
                  setBrake(parseInt(e.target.value));
                  if (parseInt(e.target.value) > 0) setThrottle(0);
                }}
                className="w-full accent-red-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none my-2"
              />
              <div className="flex gap-1.5">
                <button
                  onMouseDown={() => { setBrake(100); setThrottle(0); }}
                  onMouseUp={() => setBrake(0)}
                  onTouchStart={() => { setBrake(100); setThrottle(0); }}
                  onTouchEnd={() => setBrake(0)}
                  className="flex-1 bg-red-50 border border-red-200 text-red-500 text-[8px] py-1 rounded hover:bg-red-100 font-mono font-bold active:scale-95 transition-all"
                >
                  FULL STOP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drive Mode Selection & Regen Selection */}
      <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-2.5 mt-2.5">
        <div>
          <span className="text-[7.5px] font-label text-slate-400 tracking-widest uppercase block mb-1 font-bold">DRIVE MODE SELECTION</span>
          <div className="grid grid-cols-4 gap-1">
            {modes.map((m) => {
              const isActive = driveMode === m.id;
              let activeBtnStyle = '';
              if (isActive) {
                if (m.id === 'eco') activeBtnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-600';
                else if (m.id === 'comfort') activeBtnStyle = 'bg-sky-50 border-sky-300 text-sky-600';
                else if (m.id === 'sport') activeBtnStyle = 'bg-amber-50 border-amber-300 text-amber-600';
                else if (m.id === 'track') activeBtnStyle = 'bg-red-50 border-red-300 text-red-500';
              }
              return (
                <button
                  key={m.id}
                  onClick={() => setDriveMode(m.id)}
                  className={`border rounded py-1 px-0.5 text-[8px] font-bold text-center transition-all ${
                    isActive ? activeBtnStyle : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="text-[7.5px] font-label text-slate-400 tracking-widest uppercase block mb-1 font-bold">REGEN BRAKING STRENGTH</span>
          <div className="grid grid-cols-3 gap-1">
            {['off', 'low', 'high'].map((level) => {
              const isActive = regenLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setRegenLevel(level)}
                  className={`border rounded py-1 text-[8px] font-bold text-center transition-all uppercase ${
                    isActive 
                      ? 'border-sky-300 bg-sky-50 text-sky-600 font-bold' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Controls tooltip */}
      {!isAutopilot && (
        <div className="text-[8px] text-center text-slate-400 font-mono mt-2 pt-1 border-t border-slate-100">
          KEYBOARD COMMANDS: HOLD [W] TO ACCELERATE // HOLD [S] TO BRAKE
        </div>
      )}
    </div>
  );
};
