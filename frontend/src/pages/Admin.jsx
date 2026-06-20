import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export default function Admin() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    api.getAdminUsers().then(setUsers);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cityTrend = [
    { day: 'Mon', CO2: 820 },
    { day: 'Tue', CO2: 780 },
    { day: 'Wed', CO2: 950 },
    { day: 'Thu', CO2: 710 },
    { day: 'Fri', CO2: 680 },
    { day: 'Sat', CO2: 450 },
    { day: 'Sun', CO2: 380 }
  ];

  const distribution = [
    { range: '0-20', drivers: 2 },
    { range: '21-40', drivers: 5 },
    { range: '41-60', drivers: 18 },
    { range: '61-80', drivers: 75 },
    { range: '81-100', drivers: 142 }
  ];

  const handleExportUsers = () => {
    let headers = "Name,Email,Role,Avg Eco Score,Lifetime CO2 (g),Trips\n";
    let body = filteredUsers.map(u => 
      `"${u.name || 'User'}","${u.email}","${u.role || 'driver'}",${u.eco_score_avg || 80},${u.lifetime_co2_g || 0},${u.lifetime_trips || 0}`
    ).join("\n");
    const blob = new Blob([headers + body], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ecotrack_drivers.csv');
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-light text-white tracking-tight">Government Analytics Panel</h2>
        <p className="text-xs text-[#6b6b7a] mt-1">Review municipal vehicle compliance status records and platform growth statistics</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">REGISTERED DRIVERS</span>
          <span className="text-3xl font-light text-white font-mono">{users.length || 240} <span className="text-xs text-[#6b6b7a]">users</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">TOTAL TRIPS RECORDED</span>
          <span className="text-3xl font-light text-[#22c55e] font-mono">1,542 <span className="text-xs text-[#6b6b7a]">trips</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">CO₂ MONITORED</span>
          <span className="text-3xl font-light text-[#ef4444] font-mono">12,540 <span className="text-xs text-[#6b6b7a]">kg</span></span>
        </div>
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-semibold text-[#6b6b7a] tracking-[0.8px] uppercase block mb-1">PLATFORM ECO AVG</span>
          <span className="text-3xl font-light text-[#22c55e] font-mono">82.4 <span className="text-xs text-[#6b6b7a]">/ 100</span></span>
        </div>
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* City-wide CO2 trend */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-2 mb-4">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">City-wide Daily CO₂ Trend</span>
            <span className="text-[10px] text-[#6b6b7a] font-mono">Total Municipal Emissions</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cityTrend}>
                <defs>
                  <linearGradient id="cityCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#3a3a45" fontSize={10} tickLine={false} />
                <YAxis stroke="#3a3a45" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="CO2" name="CO₂ Emitted (kg)" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#cityCo2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eco Score Histogram */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-2 mb-4">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Eco Score Distribution</span>
            <span className="text-[10px] text-[#6b6b7a] font-mono">Active User Spread</span>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="range" stroke="#3a3a45" fontSize={10} tickLine={false} />
                <YAxis stroke="#3a3a45" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="drivers" name="Active Drivers" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* User compliance table */}
      <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-md flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.04)] pb-3">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-white">Registered Driver Compliance Ledger</span>
          
          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver name..."
              className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#3a3a45] focus:outline-none focus:border-[#22c55e]"
            />
            <button 
              onClick={handleExportUsers}
              className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] hover:bg-[#18181c] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <i className="ti ti-download"></i>
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredUsers.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#3a3a45] border-b border-[rgba(255,255,255,0.04)] text-[9px] font-semibold tracking-wider uppercase">
                  <th className="pb-2">DRIVER</th>
                  <th className="pb-2">ROLE</th>
                  <th className="pb-2">TRIPS LOGGED</th>
                  <th className="pb-2">AVG ECO SCORE</th>
                  <th className="pb-2">CO₂ EMITTED (TOTAL)</th>
                  <th className="pb-2">TAX REDUCTION STATUS</th>
                </tr>
              </thead>
              <tbody className="text-[#888888] font-mono">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-[#0e0e10]/20 transition-colors">
                    <td className="py-2.5 font-bold text-[#f1f1f3]">{u.name || u.id}</td>
                    <td className="py-2.5 capitalize">{u.role || 'driver'}</td>
                    <td className="py-2.5">{u.lifetime_trips || 0} trips</td>
                    <td className={`py-2.5 font-bold ${(u.eco_score_avg || 80) >= 80 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
                      {u.eco_score_avg || 80}
                    </td>
                    <td className="py-2.5 text-[#ef4444] font-semibold">{((u.lifetime_co2_g || 0) / 1000).toFixed(1)} kg</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        (u.eco_score_avg || 80) >= 80 
                          ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' 
                          : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                      }`}>
                        {(u.eco_score_avg || 80) >= 80 ? 'eligible' : 'ineligible'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-[12px] text-[#3a3a45] py-8">
              No registered user drivers found matching query
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
