import React, { useState } from 'react';
import { api } from '../services/api';

export default function Settings() {
  const [port, setPort] = useState('COM12');
  const [baud, setBaud] = useState('115200');
  const [testLog, setTestLog] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const [toggles, setToggles] = useState({
    harsh: true,
    lowScore: true,
    tax: true,
    summary: false
  });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestLog(["[Serial] Pinging port COM12...", "[Serial] Connection open at 115200 baud."]);
    
    try {
      const s = await api.getStatus();
      if (s.esp32_connected) {
        setTestLog(prev => [
          ...prev, 
          `[Serial] ESP32 found on port: ${s.port}`,
          `[RAW SERIAL]: Engine:1,Speed:82.0,ThrottleDelta:0.0,CO2_g_s:0.420,Status:ECO-DRIVE,Credits:85.30`
        ]);
      } else {
        setTestLog(prev => [...prev, "[Serial] Error: No device found. Verify device is plugged in."]);
      }
    } catch (e) {
      setTestLog(prev => [...prev, "[Serial] Connection timed out."]);
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportCSV = () => {
    // Basic CSV mock download builder
    const headers = "Trip ID,Distance (km),Duration (min),CO2 Emitted (g),Eco Score,Tax Status\n";
    const data = "T-4592,4.2,12,185,92,eligible\nT-1982,8.5,24,420,84,eligible\nT-3921,2.8,9,112,68,partial\n";
    const blob = new Blob([headers + data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ecotrack_trips.csv');
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-light text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-[#6b6b7a] mt-1">Configure serial connection interfaces, notification alerts, and data policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: ESP32 Connection */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white">ESP32 Configuration</span>
            <i className="ti ti-cpu text-sm text-[#22c55e]"></i>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#6b6b7a] tracking-wider uppercase font-semibold">COM PORT</label>
              <input 
                type="text" 
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="COM12"
                className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-white placeholder-[#3a3a45] focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#6b6b7a] tracking-wider uppercase font-semibold">BAUD RATE</label>
              <select 
                value={baud}
                onChange={(e) => setBaud(e.target.value)}
                className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22c55e]"
              >
                <option value="9600">9600</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] text-white hover:bg-[#18181c] text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button 
                className="flex-1 bg-[#22c55e] text-[#070708] hover:bg-[#16a34a] text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Save & Restart
              </button>
            </div>

            {testLog.length > 0 && (
              <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.04)] rounded-lg p-3 mt-2 font-mono text-[10px] text-[#6b6b7a] leading-relaxed flex flex-col gap-1">
                {testLog.map((log, i) => <span key={i}>{log}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Notifications */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white">System Notifications</span>
            <i className="ti ti-bell text-sm text-[#22c55e]"></i>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium block">Harsh driving alerts</span>
                <span className="text-[#6b6b7a] text-[11px] block mt-0.5">Push console logs for heavy engine throttle spikes</span>
              </div>
              <input 
                type="checkbox" 
                checked={toggles.harsh} 
                onChange={() => handleToggle('harsh')}
                className="accent-[#22c55e]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium block">Low eco score warnings</span>
                <span className="text-[#6b6b7a] text-[11px] block mt-0.5">Send alerts if trip score falls below 60</span>
              </div>
              <input 
                type="checkbox" 
                checked={toggles.lowScore} 
                onChange={() => handleToggle('lowScore')}
                className="accent-[#22c55e]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-white font-medium block">Tax eligibility updates</span>
                <span className="text-[#6b6b7a] text-[11px] block mt-0.5">Notify when status flips to eligible</span>
              </div>
              <input 
                type="checkbox" 
                checked={toggles.tax} 
                onChange={() => handleToggle('tax')}
                className="accent-[#22c55e]"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Account & Policy */}
        <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-4 shadow-md">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white">Account & Data Settings</span>
            <i className="ti ti-settings text-sm text-[#22c55e]"></i>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <button 
              onClick={handleExportCSV}
              className="w-full bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] hover:bg-[#18181c] text-white py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <i className="ti ti-download"></i>
              Export My Driving Data (CSV)
            </button>
            
            <button 
              className="w-full bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] py-2.5 rounded-lg text-xs font-semibold transition-all"
            >
              Reset History Logs & Statistics
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
