import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const AlertPanel = ({ telemetry }) => {
  const [alerts, setAlerts] = useState([]);
  const [activeToasts, setActiveToasts] = useState([]);
  
  // Idling tracking references
  const idleStartTimeRef = useRef(null);
  const idleAlertTriggeredRef = useRef(false);
  
  const alertIdCounter = useRef(0);

  const addAlert = (text, severity = 'warning') => {
    const newId = alertIdCounter.current++;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    
    const newAlert = {
      id: newId,
      text,
      severity,
      timestamp: timeStr
    };
    
    // Append to list, limit to last 10 items
    setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    
    // Add to transient toast notifications list
    setActiveToasts(prev => [...prev, newAlert]);
    
    // Auto dismiss toast after 4 seconds
    setTimeout(() => {
      dismissToast(newId);
    }, 4000);
  };

  const dismissToast = (id) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Run alert rules on every telemetry update
  useEffect(() => {
    if (!telemetry) return;

    const { speed, engine, throttle_delta, co2_g_s, status } = telemetry;

    // Rule 1: Harsh Acceleration
    if (throttle_delta > 0.5) {
      addAlert('Harsh Acceleration Detected', 'danger');
    }

    // Rule 2: High Emission
    if (co2_g_s > 1.0) {
      addAlert('High Emission Alert', 'danger');
    }

    // Rule 3: Aggressive Driving
    if (status === 'HIGH') {
      addAlert('Aggressive Driving Mode Active', 'warning');
    }

    // Rule 4: Engine Idling for > 10s
    if (engine === 1 && speed === 0) {
      if (!idleStartTimeRef.current) {
        idleStartTimeRef.current = Date.now();
      } else if (!idleAlertTriggeredRef.current) {
        const secondsIdling = (Date.now() - idleStartTimeRef.current) / 1000;
        if (secondsIdling > 10) {
          addAlert('Engine Idling — Turn Off Engine', 'warning');
          idleAlertTriggeredRef.current = true;
        }
      }
    } else {
      // Reset idling trackers
      idleStartTimeRef.current = null;
      idleAlertTriggeredRef.current = false;
    }

  }, [telemetry]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Overlay Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {activeToasts.map((toast) => (
          <div 
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border flex items-center justify-between shadow-premium transition-all duration-300 animate-slide-in bg-[#09090b] ${
              toast.severity === 'danger' 
                ? 'border-red-950/60 text-red-400' 
                : 'border-amber-950/60 text-amber-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className={`animate-bounce ${toast.severity === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">HUD WARNING</div>
                <p className="text-xs font-semibold text-zinc-200">{toast.text}</p>
              </div>
            </div>
            <button 
              onClick={() => dismissToast(toast.id)} 
              className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Main Alert Log Card */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium flex flex-col justify-between min-h-[260px] transition-all duration-300 hover:border-zinc-700">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center w-full mb-3 border-b border-zinc-850 pb-2">
            <span className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase">ALERTS MONITOR</span>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${alerts.length > 0 ? 'bg-[#ef4444] animate-pulse' : 'bg-[#10b981]'}`} />
              <span className="font-mono text-[9px] text-zinc-500">
                {alerts.length > 0 ? `${alerts.length} ISSUES LOGGED` : 'SYSTEMS SECURED'}
              </span>
            </div>
          </div>

          {/* Alert logs list */}
          <div className="flex flex-col gap-2 max-h-[175px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-zinc-500 font-mono text-xs">
                <ShieldCheck size={28} className="text-emerald-500 mb-1.5" />
                <span>Diagnostics normal. Operating parameters within limits.</span>
              </div>
            ) : (
              alerts.map((alert) => {
                const isDanger = alert.severity === 'danger';
                return (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between border rounded-lg p-2 text-[10.5px] font-mono ${
                      isDanger 
                        ? 'border-red-950/40 bg-red-950/10 text-red-400' 
                        : 'border-amber-950/40 bg-amber-950/10 text-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`text-[8px] font-bold px-1.5 border rounded uppercase ${
                        isDanger ? 'border-red-900/40 bg-red-950/40 text-red-400' : 'border-amber-900/40 bg-amber-950/40 text-amber-400'
                      }`}>
                        {isDanger ? 'CRIT' : 'WARN'}
                      </span>
                      <span className="truncate font-semibold text-zinc-300">{alert.text}</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                      <span className="text-zinc-500">{alert.timestamp}</span>
                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
