import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useESP32 } from '../../hooks/useESP32';
import {
  getInitials,
  getDisplayName,
  safeString
} from '../../utils/strings';

// Page title map
const PAGE_TITLES = {
  "/dashboard":   { title: "Live Dashboard", sub: "Real-time telemetry from ESP32" },
  "/analytics":   { title: "Analytics",      sub: "Historical emission data" },
  "/history":     { title: "Trip History",   sub: "Past driving sessions" },
  "/profile":     { title: "Driver Profile",  sub: "Your eco-driving stats" },
  "/settings":    { title: "Settings",       sub: "Configure your device" },
  "/admin":       { title: "Admin Panel",    sub: "Government analytics" },
  "/incentives":  { title: "Eco Incentives", sub: "Carbon credits & benefits" },
}

export default function Topbar() {
  const { user, profile } = useAuth();
  const { esp32 } = useESP32();
  const location = useLocation();
  const [toast, setToast] = useState(null);
  const prevConnectedRef = useRef(esp32?.connected ?? false);

  const currentPath = location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || {
    title: safeString(currentPath.substring(1) || 'dashboard'),
    sub: ''
  };

  const displayName = getDisplayName(profile, user, 'User');
  const initials = getInitials(displayName, 'U');
  const isConnected = esp32?.connected ?? false;
  const currentPort = esp32?.port ?? 'COM12';

  useEffect(() => {
    const prev = prevConnectedRef.current;
    if (prev !== isConnected) {
      if (isConnected) {
        setToast({
          message: 'ESP32 Connected — Live data streaming',
          type: 'success'
        });
      } else {
        setToast({
          message: 'ESP32 disconnected',
          type: 'warning'
        });
      }
      prevConnectedRef.current = isConnected;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [isConnected]);

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[999] px-4 py-3 rounded-xl border text-xs font-mono shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-300 transform translate-y-0 flex items-center gap-2.5 ${
          toast.type === 'success'
            ? 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22c55e]'
            : 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.15)] text-[#f59e0b]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${toast.type === 'success' ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`}></span>
          <span>{toast.message}</span>
        </div>
      )}

      <header className="h-[56px] bg-[#070708] border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between px-6 sticky top-0 z-50 flex-shrink-0">
        <div>
          <h1 className="text-[15px] font-medium text-[#f1f1f3] capitalize">{safeString(pageInfo.title, "Dashboard")}</h1>
          {pageInfo.sub && (
            <p className="text-[11px] text-[#6b6b7a] font-normal mt-0.5">
              {safeString(pageInfo.sub, "")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Pill */}
          {isConnected ? (
            <div className="flex items-center gap-2 bg-[rgba(34,197,94,0.07)] border border-[rgba(34,197,94,0.15)] rounded-full px-3 py-1 text-[11px] text-[#22c55e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              <span>ESP32 Connected · {safeString(currentPort, "COM12")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[rgba(245,158,11,0.07)] border border-[rgba(245,158,11,0.15)] rounded-full px-3 py-1 text-[11px] text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              <span>Waiting for ESP32...</span>
            </div>
          )}

          {/* Action buttons */}
          <button 
            className="w-[34px] h-[34px] bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-lg flex items-center justify-center text-[#6b6b7a] hover:text-[#f1f1f3] transition-all"
            onClick={() => window.location.reload()}
            title="Refresh dashboard"
          >
            <i className="ti ti-refresh text-[15px]"></i>
          </button>

          {/* User avatar */}
          <div style={{
            width:          "32px",
            height:         "32px",
            borderRadius:   "50%",
            background:     "rgba(34,197,94,0.15)",
            border:         "1px solid rgba(34,197,94,0.2)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       "11px",
            fontWeight:     600,
            color:          "#22c55e",
            userSelect:     "none",
            flexShrink:     0,
            cursor:         "default",
          }}
          title={displayName}>
            {initials}
          </div>
        </div>
      </header>
    </>
  );
}
