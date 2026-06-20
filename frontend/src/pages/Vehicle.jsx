import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { firebaseService } from '../services/firebase';
import { api } from '../services/api';

const Vehicle = (props) => {
  const routerContext = useOutletContext();
  const userId = props.userId || routerContext.userId;
  const userProfile = props.userProfile || routerContext.userProfile;
  const onProfileUpdate = props.onProfileUpdate || routerContext.reloadUserProfile;

  const [name, setName] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [regNumber, setRegNumber] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local state for ESP32 connection status
  const [deviceStatus, setDeviceStatus] = useState('Checking port...');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setVehicleName(userProfile.vehicleName || '');
      setFuelType(userProfile.fuelType || 'Petrol');
      setRegNumber(userProfile.regNumber || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await api.getStatus();
      if (status) {
        setDeviceStatus(status.connected 
          ? `ESP32 Connected on ${status.port} (${status.mock_mode ? 'Simulated' : 'COM Port'})` 
          : 'ESP32 Disconnected — Waiting for device...'
        );
      }
    };
    checkStatus();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSaveSuccess(false);

    try {
      const updatedProfile = {
        name,
        vehicleName,
        fuelType,
        regNumber
      };

      await firebaseService.updateProfile(userId, updatedProfile);
      setSaveSuccess(true);
      setIsEditing(false);
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-populated lifetime stats
  const lifetimeStats = {
    distance: 1424.5,
    co2: 284.90,
    creditsEarned: 348.50,
    creditsSoldVal: 2420
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 font-sans">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
        <div className="w-10 h-10 bg-[#111111] border border-[#1a1a1a] rounded-xl flex items-center justify-center">
          <i className="ti ti-car text-white text-[20px]"></i>
        </div>
        <div>
          <h2 className="text-[16px] font-medium tracking-wider uppercase text-white font-display">VEHICLE PROFILE</h2>
          <p className="text-[10px] font-mono text-[#444444] tracking-widest uppercase mt-0.5">Configuration panel for connected vehicle specifications and lifetime offset statistics</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] rounded-xl p-3.5 text-xs text-[#22c55e] font-mono text-center font-bold">
          ✓ Profile updated successfully in Firebase.
        </div>
      )}

      {error && (
        <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] rounded-xl p-3.5 text-xs text-[#ef4444] font-mono text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form specifications */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center w-full mb-5 border-b border-[#1a1a1a] pb-2">
              <span className="text-[10px] font-medium tracking-[0.8px] uppercase text-white">CONNECTED VEHICLE DETAILS</span>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-medium text-[#22c55e] flex items-center gap-1 hover:underline"
              >
                <i className="ti ti-edit text-[12px]"></i>
                {isEditing ? 'CANCEL EDIT' : 'EDIT PROFILE'}
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">Driver Profile Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] disabled:opacity-50 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-[#22c55e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">Vehicle Specification</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1a1a1a] disabled:opacity-50 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-[#22c55e] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">Fuel Type</label>
                  <select
                    disabled={!isEditing}
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-[#141414] border border-[#1a1a1a] disabled:opacity-50 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-[#22c55e] outline-none"
                  >
                    <option value="Petrol" className="bg-[#111111]">Petrol</option>
                    <option value="Diesel" className="bg-[#111111]">Diesel</option>
                    <option value="CNG" className="bg-[#111111]">CNG</option>
                    <option value="Electric" className="bg-[#111111]">Electric</option>
                    <option value="Hybrid" className="bg-[#111111]">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">Registration Identifier</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] disabled:opacity-50 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-[#22c55e] outline-none"
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#22c55e] hover:opacity-90 text-black font-semibold tracking-wider rounded-xl py-3 text-xs uppercase mt-2 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-premium"
                >
                  <i className="ti ti-device-floppy text-[14px]"></i>
                  SAVE SPECIFICATIONS
                </button>
              )}
            </form>
          </div>

          {/* Device configuration */}
          <div className="mt-6 pt-4 border-t border-[#1a1a1a] font-mono text-[10px] text-[#444444] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-glow"></span>
            <span>Device State: {deviceStatus}</span>
          </div>
        </div>

        {/* Right Column: Lifetime analytics statistics */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 shadow-premium">
          <h3 className="text-[10px] font-medium tracking-[0.8px] uppercase text-white mb-4 pb-2 border-b border-[#1a1a1a] flex items-center gap-1.5">
            <i className="ti ti-trophy text-[#22c55e]"></i>
            LIFETIME TRIP REGISTERS
          </h3>

          <div className="flex flex-col gap-4">
            <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#444444] tracking-widest uppercase block mb-0.5">ODOMETER TOTAL</span>
                <span className="text-lg font-mono font-bold text-white">{lifetimeStats.distance.toFixed(1)} km</span>
              </div>
              <span className="text-xl">🛣️</span>
            </div>

            <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#444444] tracking-widest uppercase block mb-0.5">NET CARBON OFFSET</span>
                <span className="text-lg font-mono font-bold text-[#22c55e]">{lifetimeStats.co2.toFixed(1)} kg CO₂</span>
              </div>
              <span className="text-xl">🌳</span>
            </div>

            <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#444444] tracking-widest uppercase block mb-0.5">ACCUMULATED BALANCE</span>
                <span className="text-lg font-mono font-bold text-white">{lifetimeStats.creditsEarned.toFixed(2)} CCR</span>
              </div>
              <span className="text-xl">💳</span>
            </div>

            <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-[#444444] tracking-widest uppercase block mb-0.5">EXCHANGE EARNINGS</span>
                <span className="text-lg font-mono font-bold text-[#f59e0b]">₹{lifetimeStats.creditsSoldVal}</span>
              </div>
              <span className="text-xl">💸</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Vehicle;
