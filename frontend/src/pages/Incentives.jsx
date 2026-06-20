import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useESP32 } from '../hooks/useESP32';
import { firebaseService } from '../services/firebase';
import PremiumButton from '../components/ui/PremiumButton';
import { getDisplayName, safeString } from '../utils/strings';

export default function Incentives() {
  const { user, profile } = useAuth();
  const { telemetry, connected } = useESP32();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [ecoPoints] = useState(840);
  const [pointsLog] = useState([
    { id: 1, date: '2026-06-07', desc: 'Smooth highway drive session bonus', points: 120 },
    { id: 2, date: '2026-06-06', desc: 'Zero Idle commute award', points: 80 },
    { id: 3, date: '2026-06-05', desc: 'Maintain Gold tier weekly streak', points: 200 },
    { id: 4, date: '2026-06-04', desc: 'Completed EV lane driving validation', points: 150 }
  ]);

  const name = getDisplayName(profile, user, 'Driver');
  const regNo = safeString(profile?.regNumber, 'MH-12-XX-0000');
  const vehicle = safeString(profile?.vehicleName, 'Model X');

  const ecoScore = connected && telemetry?.ecoScore !== undefined ? telemetry.ecoScore : (profile?.ecoScore || 85);
  const credits = connected && telemetry?.credits !== undefined && telemetry?.credits !== null ? telemetry.credits : (profile?.credits || 100.00);
  
  // Tiers and Eligibility Calculations
  const getTaxStatus = (score) => {
    if (score >= 80) return { label: 'GOLD TIER ELIGIBLE', discount: '15% Road Tax Reduction', class: 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/5' };
    if (score >= 60) return { label: 'SILVER TIER ELIGIBLE', discount: '8% Road Tax Reduction', class: 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5' };
    return { label: 'BRONZE TIER', discount: '0% (Requires Score >= 60)', class: 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/5' };
  };

  const status = getTaxStatus(ecoScore);

  useEffect(() => {
    firebaseService.getLeaderboard().then(res => setLeaderboard(res));
  }, []);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 font-sans selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.04)] pb-4">
        <div className="w-10 h-10 bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <i className="ti ti-certificate text-[#22c55e] text-[20px]"></i>
        </div>
        <div>
          <h2 className="text-[16px] font-medium tracking-wider uppercase text-white font-display">Government Eco Incentives</h2>
          <p className="text-[10px] font-mono text-[#6b6b7a] tracking-widest uppercase mt-0.5">
            Earn road tax reductions, priority EV charging status, and redeem city eco points.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Benefits Cards (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Status / Road Tax Reduction Card */}
          <div className="premium-card premium-card-hover rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[9px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">Incentive Status Tier</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div>
                <h3 className="text-2xl font-light text-white leading-tight">
                  {status.label}
                </h3>
                <p className="text-xs text-[#22c55e] mt-1 font-mono">{status.discount}</p>
              </div>
              <div className="bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-2 text-center flex-shrink-0 min-w-[140px]">
                <span className="text-[10px] text-[#6b6b7a] block font-mono">CARBON CREDIT VALUE</span>
                <span className="text-xl font-light font-mono text-white block">₹{(credits * 11.5).toFixed(2)}</span>
                <span className="text-[10px] font-mono text-[#22c55e] block mt-0.5">{Number(credits).toFixed(2)} CC</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.04)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#131316]/60 border border-[rgba(255,255,255,0.03)] rounded-xl p-3.5">
                <span className="text-[10px] text-[#6b6b7a] block mb-1">PRIORITY EV INCENTIVE</span>
                <span className="text-[#22c55e] font-semibold flex items-center gap-1.5">
                  <i className="ti ti-charging-pile text-sm"></i>
                  {ecoScore >= 75 ? 'ELIGIBLE' : 'INELIGIBLE'}
                </span>
                <span className="text-[9px] text-[#3a3a45] block mt-1">Priority green lanes & free charging slots</span>
              </div>

              <div className="bg-[#131316]/60 border border-[rgba(255,255,255,0.03)] rounded-xl p-3.5">
                <span className="text-[10px] text-[#6b6b7a] block mb-1">CITY TOLL REBATES</span>
                <span className="text-[#22c55e] font-semibold flex items-center gap-1.5">
                  <i className="ti ti-map-pin text-sm"></i>
                  {ecoScore >= 80 ? 'ACTIVE (100% OFF)' : ecoScore >= 60 ? 'ACTIVE (50% OFF)' : 'INACTIVE'}
                </span>
                <span className="text-[9px] text-[#3a3a45] block mt-1">Smart City Toll Reduction rebates applied</span>
              </div>

              <div className="bg-[#131316]/60 border border-[rgba(255,255,255,0.03)] rounded-xl p-3.5">
                <span className="text-[10px] text-[#6b6b7a] block mb-1">MOBILITY REWARDS</span>
                <span className="text-[#22c55e] font-semibold flex items-center gap-1.5">
                  <i className="ti ti-ticket text-sm"></i>
                  {ecoScore >= 70 ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <span className="text-[9px] text-[#3a3a45] block mt-1">Redeemable public transit vouchers</span>
              </div>
            </div>
          </div>

          {/* Smart City Eco Points Card */}
          <div className="premium-card rounded-2xl p-6">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <i className="ti ti-coins text-[#22c55e] text-[18px]"></i>
                <span className="text-xs font-semibold text-white tracking-wider uppercase">Smart City Eco Points Ledger</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b6b7a]">Balance:</span>
                <span className="text-sm font-semibold font-mono text-white">{ecoPoints} pts</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
              {pointsLog.map((log) => (
                <div key={log.id} className="flex justify-between items-center bg-[#131316]/50 border border-[rgba(255,255,255,0.02)] p-3 rounded-xl hover:border-[#22c55e]/15 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-white/90">{log.desc}</span>
                    <span className="text-[9px] text-[#6b6b7a] font-mono">{log.date}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#22c55e]">+{log.points} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Driver Certification (Printable Certificate Card) */}
          <div className="premium-card rounded-2xl p-6 relative overflow-hidden">
            <span className="text-[9px] font-semibold text-[#6b6b7a] tracking-[1px] uppercase block mb-1">Eco-driving accreditation</span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center text-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.15)] flex-shrink-0">
                  <i className="ti ti-certificate text-3xl"></i>
                </div>
                <div>
                  <h4 className="text-[14px] font-semibold text-white">Digital Green Driving Certificate</h4>
                  <p className="text-[11px] text-[#6b6b7a] mt-1 leading-relaxed">
                    Issued officially to drivers maintaining an eco rating above 80. Verifiable by road transport departments.
                  </p>
                </div>
              </div>
              <PremiumButton onClick={handlePrintCertificate} className="flex-shrink-0">
                <i className="ti ti-printer text-xs mr-1"></i> PRINT CREDENTIALS
              </PremiumButton>
            </div>

            {/* Simulated certificate badge graphics */}
            <div className="mt-6 border border-dashed border-[#22c55e]/20 rounded-xl p-6 bg-[#131316]/30 flex flex-col items-center justify-center text-center">
              <h5 className="text-xs font-bold text-white tracking-[2px] uppercase mb-1">ECOTRACK GREEN CREDENTIAL</h5>
              <div className="w-16 h-[1px] bg-emerald-500/20 my-2" />
              <p className="text-[10px] text-[#6b6b7a] leading-relaxed">
                This certifies that <strong className="text-white">{name}</strong> driving <strong className="text-white">{vehicle}</strong> ({regNo}) is accredited as an ECO-FRIENDLY DRIVER with an active rating of <strong className="text-[#22c55e]">{ecoScore}/100</strong>.
              </p>
              <div className="flex justify-between w-full max-w-md mt-6 text-[8px] font-mono text-[#3a3a45] uppercase">
                <span>ISSUED: {new Date().toLocaleDateString()}</span>
                <span>ID: ECO-{safeString(name, 'DRV').substring(0,3).toUpperCase()}-2026</span>
                <span>STATUS: VERIFIED ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Rankings Leaderboard (lg:col-span-4) */}
        <div className="lg:col-span-4">
          <div className="premium-card rounded-2xl p-5 shadow-md">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3 mb-4">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white flex items-center gap-1.5">
                <i className="ti ti-crown text-[#22c55e]"></i>
                Sustainability Ranks
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {leaderboard.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    item.name === name 
                      ? 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)]' 
                      : 'bg-[#131316]/40 border-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      idx === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      idx === 1 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                      idx === 2 ? 'bg-amber-700/10 text-amber-700 border border-amber-700/20' :
                      'bg-[#18181c] text-[#6b6b7a]'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-white/95">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#22c55e]">{item.ecoScore} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
