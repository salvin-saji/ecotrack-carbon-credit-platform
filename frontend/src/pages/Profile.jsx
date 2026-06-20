import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTripHistory } from '../hooks/useTripHistory';
import {
  getInitials,
  getDisplayName,
  getRoleLabel,
  safeString
} from '../utils/strings';

export default function Profile() {
  const { user, profile } = useAuth();
  const { trips = [] } = useTripHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(getDisplayName(profile, user, 'Driver'));

  const validTrips = Array.isArray(trips) ? trips : [];
  const avgEcoScore = validTrips.length
    ? Math.round(validTrips.reduce((acc, t) => acc + (t.eco_score || 0), 0) / validTrips.length)
    : Number(profile?.eco_score_avg ?? 82);

  const isEligible = avgEcoScore >= 80;
  const initials = getInitials(name, 'DR');
  const roleLabel = getRoleLabel(profile);

  const handleSave = () => {
    setIsEditing(false);
    // Profile updates are handled locally or dynamically
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-light text-white tracking-tight">Driver Profile</h2>
        <p className="text-xs text-[#6b6b7a] mt-1">Review your sustainability scores and official green certifications</p>
      </div>

      {/* Driver info */}
      <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-md flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white">Driver Profile Details</span>
            <i className="ti ti-user text-sm text-[#22c55e]"></i>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#22c55e] text-[#070708] flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                  />
                  <button onClick={handleSave} className="bg-[#22c55e] text-[#070708] px-3 py-1 rounded text-xs font-semibold">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{name}</h3>
                  <button onClick={() => setIsEditing(true)} className="text-[10px] text-[#22c55e] hover:underline">Edit</button>
                </div>
              )}
              <span className="block text-xs text-[#6b6b7a] mt-1 font-mono">{safeString(user?.email || profile?.email, 'driver@ecotrack.com')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-[rgba(255,255,255,0.03)] pt-4 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#6b6b7a]">Account Type:</span>
              <span className="text-white capitalize">{roleLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b7a]">Active Since:</span>
              <span className="text-white">June 2026</span>
            </div>
          </div>
        </div>

      {/* Bottom card - Tax reduction Certificate */}
      <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-md flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-white">Government Green Driver Certification</span>
          <i className="ti ti-certificate text-sm text-[#22c55e]"></i>
        </div>

        {isEligible ? (
          <div className="bg-[#0e0e10] border border-[rgba(34,197,94,0.15)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden" style={{
            backgroundImage: `radial-gradient(circle at 100% 50%, rgba(34,197,94,0.04) 0%, transparent 60%)`
          }}>
            <div className="flex flex-col gap-2.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-[#22c55e] text-xs font-semibold uppercase tracking-wider mx-auto sm:mx-0">
                <i className="ti ti-certificate"></i>
                <span>✓ CERTIFIED GREEN DRIVER</span>
              </div>
              <h4 className="text-lg font-light text-white leading-tight">Eligible for Government Eco Tax Reduction Program</h4>
              <p className="text-xs text-[#6b6b7a] max-w-md">
                This certificate verifies that {name} maintains a lifetime eco score average of 80 or above, meeting eligibility criteria for green driving tax reductions.
              </p>
            </div>

            {/* QR code mockup */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                <i className="ti ti-qrcode text-5xl text-[#6b6b7a]"></i>
              </div>
              <button className="text-[10px] text-[#22c55e] hover:underline font-mono uppercase tracking-wider">Download PDF</button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0e0e10] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Certification Pending</h4>
              <p className="text-xs text-[#6b6b7a] mt-1">
                Maintain an average driving eco score of 80 or higher to earn your certified green driver road tax reduction credentials.
              </p>
            </div>

            {/* Progress tracker */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span>Current score average: {avgEcoScore} / 100</span>
                <span>Requirement: 80</span>
              </div>
              <div className="w-full bg-[#131316] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 bg-[#ef4444]`} 
                  style={{ width: `${(avgEcoScore / 80) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
