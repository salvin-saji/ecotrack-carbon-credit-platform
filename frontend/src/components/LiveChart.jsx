import React from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const LiveChart = ({ history }) => {
  // Format dates to short times
  const formatTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      return timeStr;
    }
  };

  // Convert histories into formats readable by Recharts
  const chartData = history.map(item => ({
    ...item,
    timeLabel: formatTime(item.timestamp)
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Chart 1: Speed vs Time */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium transition-all duration-300 hover:border-zinc-700">
        <h3 className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase mb-4 pb-2 border-b border-zinc-850">SPEED PROFILE (km/h)</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
              <XAxis dataKey="timeLabel" stroke="#52525b" fontSize={9} />
              <YAxis stroke="#52525b" fontSize={9} domain={[0, 120]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#38bdf8' }}
                labelStyle={{ color: '#a1a1aa', fontSize: 10 }}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: CO2 Rate vs Time */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium transition-all duration-300 hover:border-zinc-700">
        <h3 className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase mb-4 pb-2 border-b border-zinc-850">CO₂ OUTPUT RATE (g/s)</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
              <XAxis dataKey="timeLabel" stroke="#52525b" fontSize={9} />
              <YAxis stroke="#52525b" fontSize={9} domain={[0, 2.0]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#ef4444' }}
                labelStyle={{ color: '#a1a1aa', fontSize: 10 }}
              />
              <Area 
                type="monotone" 
                dataKey="co2_g_s" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#co2Grad)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Credits vs Time */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-premium transition-all duration-300 hover:border-zinc-700">
        <h3 className="font-display tracking-widest text-zinc-400 text-xs font-bold uppercase mb-4 pb-2 border-b border-zinc-850">WALLET LEDGER BALANCES</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
              <XAxis dataKey="timeLabel" stroke="#52525b" fontSize={9} />
              <YAxis stroke="#52525b" fontSize={9} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#34d399' }}
                labelStyle={{ color: '#a1a1aa', fontSize: 10 }}
              />
              <Bar 
                dataKey="credits" 
                fill="#34d399" 
                radius={[2, 2, 0, 0]}
                maxBarSize={15}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
