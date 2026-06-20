import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useESP32 } from '../../hooks/useESP32';
import {
  getInitials,
  getDisplayName,
  getRoleLabel,
  safeString
} from '../../utils/strings';

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const { alerts = [] } = useESP32();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      // replace:true removes /dashboard from history stack entirely.
      // Pressing Back from Home will NOT revisit /login or /dashboard.
      navigate('/', { replace: true });
    } catch (err) {
      console.error("[Sidebar] Logout error:", err);
      navigate('/', { replace: true });
    }
  };

  const navItem = (path, label, iconClass, badgeCount = 0, badgeType = 'default') => {
    const isActive = location.pathname === path;
    const safeLabel = safeString(label, "");
    return (
      <button
        onClick={() => navigate(path)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-[13px] font-normal border ${
          isActive
            ? 'bg-[rgba(34,197,94,0.07)] border-[rgba(34,197,94,0.12)] text-[#22c55e]'
            : 'border-transparent text-[#888888] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <i className={`ti ${iconClass} text-[15px] ${isActive ? 'text-[#22c55e]' : 'text-[#888888]'}`}></i>
          <span>{safeLabel}</span>
        </span>
        {badgeCount > 0 && (
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-medium ${
            badgeType === 'danger'
              ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
              : 'bg-[#18181c] text-[#6b6b7a]'
          }`}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>
    );
  };

  const name = getDisplayName(profile, user, 'Driver');
  const rawRole = safeString(profile?.role, 'driver');
  const role = rawRole.toLowerCase();
  const roleLabel = getRoleLabel(profile);
  const initials = getInitials(name, 'DR');
  const validAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <aside className="w-[220px] bg-[#0e0e10] border-r border-[rgba(255,255,255,0.04)] flex flex-col justify-between h-screen overflow-hidden flex-shrink-0 z-20">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand logo */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
          <span className="text-[15px] font-semibold tracking-tight text-[#f1f1f3] font-display">EcoTrack</span>
        </div>

        {/* Groups */}
        <div className="p-3 flex flex-col gap-4">
          <div>
            <div className="px-3 text-[10px] font-medium text-[#3a3a45] tracking-[1.2px] uppercase mb-1.5">OVERVIEW</div>
            <div className="flex flex-col gap-0.5">
              {navItem('/dashboard', 'Dashboard', 'ti-layout-dashboard')}
              {navItem('/analytics', 'Analytics', 'ti-chart-line')}
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-medium text-[#3a3a45] tracking-[1.2px] uppercase mb-1.5">MONITORING</div>
            <div className="flex flex-col gap-0.5">
              {navItem('/dashboard', 'Eco Score', 'ti-leaf')}
              {navItem('/dashboard', 'Alerts', 'ti-bell', validAlerts.length, 'danger')}
              {navItem('/incentives', 'Eco Incentives', 'ti-certificate')}
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-medium text-[#3a3a45] tracking-[1.2px] uppercase mb-1.5">ACCOUNT</div>
            <div className="flex flex-col gap-0.5">
              {navItem('/profile', 'Profile', 'ti-user')}
              {navItem('/settings', 'Settings', 'ti-settings')}
              {role === 'admin' && navItem('/admin', 'Admin', 'ti-shield')}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned User Details */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-2 bg-[#131316] p-2.5 rounded-xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#22c55e] text-[#070708] flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <span className="block text-[12px] font-medium text-[#f1f1f3] truncate">{name}</span>
              <span className="block text-[10px] text-[#6b6b7a] tracking-[0.8px] font-medium uppercase truncate">{roleLabel}</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-[#6b6b7a] hover:text-[#ef4444] transition-all p-1.5 hover:bg-[#18181c] rounded-lg"
            title="Logout Session"
          >
            <i className="ti ti-logout text-[15px]"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
