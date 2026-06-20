import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="w-screen h-screen bg-[#070708] flex flex-col items-center justify-center gap-4">
      <div className="w-3 h-3 rounded-full bg-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
      <span className="text-[#6b6b7a] text-[13px] font-mono tracking-wider">
        Loading EcoTrack...
      </span>
    </div>
  );
}
