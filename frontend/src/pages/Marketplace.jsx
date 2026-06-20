import React from 'react';
import { MarketplaceTable } from '../components/MarketplaceTable';

export const Marketplace = ({ userId, userProfile, onBalanceUpdate }) => {
  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 font-sans">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
        <div className="w-10 h-10 bg-[#111111] border border-[#1a1a1a] rounded-xl flex items-center justify-center">
          <i className="ti ti-currency-dollar text-white text-[20px]"></i>
        </div>
        <div>
          <h2 className="text-[16px] font-medium tracking-wider uppercase text-white font-display">CARBON EXCHANGE</h2>
          <p className="text-[10px] font-mono text-[#444444] tracking-widest uppercase mt-0.5">Real-time marketplace listings and credit wallets trading ledger</p>
        </div>
      </div>

      {/* Embedding Marketplace Table */}
      <MarketplaceTable 
        userId={userId} 
        userProfile={userProfile} 
        onBalanceUpdate={onBalanceUpdate} 
      />
    </div>
  );
};

export default Marketplace;
