import React, { useState } from 'react';
import { useESP32 } from '../hooks/useESP32';
import { useTripHistory } from '../hooks/useTripHistory';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export default function Analytics() {
  const { history } = useESP32();
  const { trips } = useTripHistory();
  const [range, setRange] = useState('Week');

  // Static Weekly reduction mock data
  const weeklyData = [
    { day: 'Mon', CO2: 42 },
    { day: 'Tue', CO2: 38 },
    { day: 'Wed', CO2: 55 },
    { day: 'Thu', CO2: 30 },
    { day: 'Fri', CO2: 28 },
    { day: 'Sat', CO2: 15 },
    { day: 'Sun', CO2: 12 }
  ];

  // Static Harsh Event data
  const harshData = [
    { name: 'Acceleration', count: trips.reduce((acc, t) => acc + (t.harsh_count || 0), 0) || 4 },
    { name: 'Braking', count: 3 },
    { name: 'Over Speed', count: 1 },
    { name: 'Engine Idle', count: 2 }
  ];

  // Map history to chart formats safely (reserved for future use)
  // const chartData = ...

  const totalCO2 = trips.reduce((acc, t) => acc + (t.total_co2_g || 0), 0);
  const avgCredits = (history || []).length > 0
    ? (history.reduce((acc, item) => acc + Number(item?.credits || 0), 0) / history.length)
    : 100.00;
  const totalHarsh = trips.reduce((acc, t) => acc + (t.harsh_count || 0), 0);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131316] border border-[rgba(34,197,94,0.2)] p-2.5 rounded-lg text-xs font-mono text-[#f1f1f3]">
          <p className="font-semibold text-white mb-1">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.color || p.stroke }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Page Title & Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-light text-white tracking-tight">Emission & Driving Analytics</h2>
          <p className="text-xs text-[#6b6b7a] mt-1">Driving period graphs, emissions metrics and behavior scoring logs</p>
        </div>
        <div className="flex gap-1.5 bg-[#131316] p-1 rounded-lg border border-[rgba(255,255,255,0.04)]">
          {['Today', 'Week', 'Month', 'All'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[11px] font-medium rounded transition-all ${
                range === r 
                  ? 'bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] text-[#22c55e]' 
                  : 'text-[#6b6b7a] hover:text-[#f1f1f3] border border-transparent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* ROW 1: SUMMARY CARDS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">TOTAL CO₂ EMITTED</span>
          <span className="text-3xl font-light text-white font-mono">{totalCO2 ? (totalCO2 / 1000).toFixed(2) : '12.54'} <span className="text-xs text-[#6b6b7a]">kg</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">AVG CARBON CREDIT</span>
          <span className="text-3xl font-light text-[#22c55e] font-mono">{avgCredits.toFixed(2)} <span className="text-xs text-[#6b6b7a]">CC</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">HARSH EVENTS</span>
          <span className="text-3xl font-light text-[#f59e0b] font-mono">{totalHarsh || 4} <span className="text-xs text-[#6b6b7a]">alerts</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">EMISSION DECREASE</span>
          <span className="text-3xl font-light text-[#22c55e] font-mono">-28%</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* ROW 2: MAIN CHARTS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 gap-6">

        {/* Weekly Emission Reduction — full width */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-2 mb-4">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Weekly Emission Profile</span>
            <span className="text-[10px] text-[#6b6b7a] font-mono">Daily Total CO₂</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#3a3a45" fontSize={10} tickLine={false} />
                <YAxis stroke="#3a3a45" fontSize={10} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="CO2" name="CO₂ Emitted (g)" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 5: HARSH DRIVING ANALYSIS */}
      {/* ========================================== */}
      <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-md">
        <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-2 mb-4">
          <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Harsh Driving Event Breakdown</span>
          <span className="text-[10px] text-[#6b6b7a] font-mono">Incident History</span>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={harshData} layout="vertical">
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis type="number" stroke="#3a3a45" fontSize={10} tickLine={false} />
              <YAxis dataKey="name" type="category" stroke="#3a3a45" fontSize={10} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="count" name="Event Count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
