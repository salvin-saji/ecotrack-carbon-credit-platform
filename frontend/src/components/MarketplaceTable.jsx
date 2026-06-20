import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';

export const MarketplaceTable = ({ userId, userProfile, onBalanceUpdate }) => {
  // Price Ticker simulation (spec: Current Carbon Credit Price: ₹11.5, fluctuates +-0.5 every 30s)
  const [currentPrice, setCurrentPrice] = useState(11.5);
  const [priceDirection, setPriceDirection] = useState('flat'); // 'up', 'down', or 'flat'

  // Listings & transactions lists
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Modals state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Form states
  const [selectedSeller, setSelectedSeller] = useState('');
  const [buyQty, setBuyQty] = useState(10);
  const [sellQty, setSellQty] = useState(10);
  const [sellPrice, setSellPrice] = useState(11.0);
  const [formError, setFormError] = useState('');

  // 1. Price Ticker simulation (±0.5 every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = (Math.random() * 1.0 - 0.5); // fluctuates between -0.5 and +0.5
      setCurrentPrice((prev) => {
        const next = Math.max(8.0, Math.min(20.0, prev + delta));
        setPriceDirection(next > prev ? 'up' : 'down');
        return parseFloat(next.toFixed(2));
      });
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // 2. Load listings, transactions & leaderboard from Firebase service
  const loadMarketData = async () => {
    try {
      const activeListings = await firebaseService.getMarketListings();
      setListings(activeListings);

      const txs = await firebaseService.getTransactions(userId);
      setTransactions(txs.sort((a, b) => new Date(b.date) - new Date(a.date)));

      const ranks = await firebaseService.getLeaderboard();
      setLeaderboard(ranks);
    } catch (e) {
      console.error('[Market] Error loading data: ', e);
    }
  };

  useEffect(() => {
    if (userId) {
      loadMarketData();
    }
  }, [userId]);

  // 3. Handle Credits Purchase (Buy Modal)
  const handleBuyCredits = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedSeller) {
      setFormError('Please select a seller listing.');
      return;
    }
    if (buyQty <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }

    const sellerListing = listings.find(l => l.id === selectedSeller);
    if (!sellerListing) {
      setFormError('Selected listing could not be found.');
      return;
    }

    if (sellerListing.credits < buyQty) {
      setFormError(`This listing only has ${sellerListing.credits} credits available.`);
      return;
    }

    try {
      // Execute the purchase
      await firebaseService.buyCredits(userId, selectedSeller, buyQty);
      
      // Update UI state
      setShowBuyModal(false);
      setBuyQty(10);
      setSelectedSeller('');
      
      // Reload and update balance
      await loadMarketData();
      if (onBalanceUpdate) {
        onBalanceUpdate();
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  // 4. Handle Create Listing (Sell Modal)
  const handleSellCredits = async (e) => {
    e.preventDefault();
    setFormError('');

    const currentBalance = userProfile?.credits || 0.0;
    if (sellQty <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }
    if (sellQty > currentBalance) {
      setFormError(`Insufficient credits. Your balance is ${currentBalance.toFixed(2)} CCR.`);
      return;
    }
    if (sellPrice <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }

    try {
      const newListing = {
        name: userProfile?.name || userId.split('@')[0],
        type: 'SELL',
        credits: sellQty,
        price: parseFloat(sellPrice)
      };

      await firebaseService.addMarketListing(newListing);

      const nextBalance = currentBalance - sellQty;
      await firebaseService.updateProfile(userId, { credits: nextBalance });

      const tx = {
        date: new Date().toISOString(),
        from: userId,
        to: 'Marketplace',
        credits: sellQty,
        amount: sellQty * sellPrice,
        type: 'SELL'
      };
      await firebaseService.logTransaction(userId, tx);

      // Close modal
      setShowSellModal(false);
      setSellQty(10);
      setSellPrice(11.0);
      
      await loadMarketData();
      if (onBalanceUpdate) {
        onBalanceUpdate();
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const sellListings = listings.filter(l => l.type === 'SELL');

  return (
    <div className="flex flex-col gap-6 text-[#888888]">
      {/* 1. Market Price Ticker */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 shadow-premium flex items-center justify-between overflow-hidden relative">
        <div>
          <span className="text-[10px] font-medium tracking-[0.8px] uppercase block mb-1">LIVE EXCHANGE INDICATOR</span>
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-light text-white leading-none">
              ₹{currentPrice.toFixed(2)}
            </span>
            <span className="text-[12px] text-[#444444] font-mono">per carbon credit (CCR)</span>
          </div>
        </div>

        {/* Change Direction Badge */}
        <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-lg border ${
          priceDirection === 'up' 
            ? 'text-[#22c55e] bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)]' 
            : priceDirection === 'down'
            ? 'text-[#ef4444] bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.15)]'
            : 'text-[#888888] bg-[#141414] border-[#1a1a1a]'
        }`}>
          {priceDirection === 'up' ? <i className="ti ti-arrow-up-right"></i> : priceDirection === 'down' ? <i className="ti ti-arrow-down-right"></i> : null}
          <span className="uppercase text-[11px] font-semibold">{priceDirection === 'flat' ? 'STABLE' : priceDirection}</span>
        </div>
      </div>

      {/* Action Buttons & Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Listings and actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Action Row */}
          <div className="flex gap-4">
            <button 
              onClick={() => { setFormError(''); setShowBuyModal(true); }}
              className="flex-1 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] hover:border-[#22c55e] text-[#22c55e] py-3 rounded-lg font-medium text-[13px] tracking-wide transition-all shadow-premium flex items-center justify-center gap-2"
            >
              <i className="ti ti-currency-dollar"></i>
              BUY CREDITS
            </button>
            <button 
              onClick={() => { setFormError(''); setShowSellModal(true); }}
              className="flex-1 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] hover:border-[#ef4444] text-[#ef4444] py-3 rounded-lg font-medium text-[13px] tracking-wide transition-all shadow-premium flex items-center justify-center gap-2"
            >
              <i className="ti ti-plus"></i>
              SELL CREDITS
            </button>
          </div>

          {/* Active Listings Table */}
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 shadow-premium">
            <h3 className="text-[10px] font-medium tracking-[0.8px] uppercase text-white mb-4 pb-2 border-b border-[#1a1a1a]">ACTIVE EXCHANGE ORDER BOOK</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#333333] border-b border-[#1a1a1a] text-[10px] font-medium tracking-[0.8px] uppercase">
                    <th className="pb-2">ENTITY</th>
                    <th className="pb-2">TYPE</th>
                    <th className="pb-2">QTY (CCR)</th>
                    <th className="pb-2">PRICE (₹/CCR)</th>
                    <th className="pb-2">TOTAL (₹)</th>
                  </tr>
                </thead>
                <tbody className="text-[#888888]">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#444444]">No order listings registered.</td>
                    </tr>
                  ) : (
                    listings.map((list) => {
                      const isBuy = list.type === 'BUY';
                      return (
                        <tr 
                          key={list.id} 
                          className={`border-b border-[#141414] transition-colors ${
                            isBuy ? 'bg-[rgba(34,197,94,0.02)] border-l-2 border-[#22c55e]' : 'bg-[rgba(239,68,68,0.02)] border-l-2 border-[#ef4444]'
                          }`}
                        >
                          <td className="py-2.5 font-semibold text-white font-display px-2">{list.name}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] border font-bold ${
                              isBuy ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.2)]'
                            }`}>
                              {list.type}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold">{list.credits}</td>
                          <td className="py-2.5 font-bold">₹{list.price.toFixed(2)}</td>
                          <td className="py-2.5 text-white font-bold px-2">₹{(list.credits * list.price).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Leaderboard */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 shadow-premium">
          <h3 className="text-[10px] font-medium tracking-[0.8px] uppercase text-white mb-4 pb-2 border-b border-[#1a1a1a] flex items-center gap-1.5">
            <i className="ti ti-trophy text-[#22c55e]"></i>
            WEEKLY DRIVER LEADERBOARD
          </h3>

          <div className="flex flex-col gap-3">
            {leaderboard.map((item) => {
              let trophy = '';
              if (item.rank === 1) trophy = '🥇';
              else if (item.rank === 2) trophy = '🥈';
              else if (item.rank === 3) trophy = '🥉';

              return (
                <div 
                  key={item.rank}
                  className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-3 flex items-center justify-between hover:border-[#22c55e] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono text-[#444444] w-6 flex-shrink-0 text-center">
                      {trophy || `#${item.rank}`}
                    </span>
                    <div>
                      <div className="font-display font-medium text-xs text-white">{item.name}</div>
                      <div className="text-[9px] font-mono text-[#444444]">ECO Score: {item.ecoScore}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#22c55e]">+{item.creditsEarned.toFixed(1)}</div>
                    <div className="text-[7.5px] font-display text-[#444444] tracking-widest uppercase">CCR EARNED</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Transaction History Table */}
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 shadow-premium">
        <h3 className="text-[10px] font-medium tracking-[0.8px] uppercase text-white mb-4 pb-2 border-b border-[#1a1a1a]">EXCHANGE TRANSACTION LEDGER</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-left text-xs border-collapse">
            <thead>
              <tr className="text-[#333333] border-b border-[#1a1a1a] text-[10px] font-medium tracking-[0.8px] uppercase">
                <th className="pb-2">DATE</th>
                <th className="pb-2">FROM</th>
                <th className="pb-2">TO</th>
                <th className="pb-2">CREDITS</th>
                <th className="pb-2">AMOUNT (₹)</th>
                <th className="pb-2">TYPE</th>
              </tr>
            </thead>
            <tbody className="text-[#888888]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#444444]">No transactional history logged.</td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-[#141414] hover:bg-[#141414] transition-colors">
                    <td className="py-2.5 text-[#444444]">{new Date(tx.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="py-2.5 font-semibold text-white truncate max-w-[120px]">{tx.from}</td>
                    <td className="py-2.5 font-semibold text-white truncate max-w-[120px]">{tx.to}</td>
                    <td className="py-2.5 font-bold text-[#22c55e]">{tx.credits}</td>
                    <td className="py-2.5 font-bold text-white">₹{tx.amount.toFixed(2)}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        tx.type === 'BUY' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.2)]'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BUY MODAL */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-premium">
            <h3 className="font-display font-medium text-white text-lg tracking-tight mb-4 uppercase">PURCHASE ECO CREDITS</h3>
            
            {formError && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg p-3 text-xs text-[#ef4444] mb-4 font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleBuyCredits} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">SELECT SELLER ORDER</label>
                <select 
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-[#22c55e] outline-none"
                >
                  <option value="" className="bg-[#111111]">-- Choose Listing --</option>
                  {sellListings.map(l => (
                    <option key={l.id} value={l.id} className="bg-[#111111]">
                      {l.name} - {l.credits} CCR @ ₹{l.price}/credit
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">QUANTITY TO BUY</label>
                <input 
                  type="number" 
                  min="1"
                  value={buyQty}
                  onChange={(e) => setBuyQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-[#22c55e] outline-none"
                />
              </div>

              {selectedSeller && (
                <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3 text-xs font-mono flex justify-between">
                  <span className="text-[#444444]">TOTAL COST:</span>
                  <span className="text-white font-bold">
                    ₹{(buyQty * (listings.find(l => l.id === selectedSeller)?.price || 0)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 bg-[#141414] hover:bg-[#1e1e1e] border border-[#1a1a1a] text-[#888888] rounded-xl py-2.5 text-xs font-medium uppercase transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#22c55e] hover:opacity-90 text-black font-semibold rounded-xl py-2.5 text-xs uppercase transition-all"
                >
                  CONFIRM PURCHASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELL MODAL */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl p-6 max-w-md w-full animate-scale-in shadow-premium">
            <h3 className="font-display font-medium text-white text-lg tracking-tight mb-4 uppercase">CREATE EXCHANGE ORDER</h3>
            
            {formError && (
              <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg p-3 text-xs text-[#ef4444] mb-4 font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSellCredits} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">QUANTITY TO SELL</label>
                <input 
                  type="number" 
                  min="1"
                  value={sellQty}
                  onChange={(e) => setSellQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-[#22c55e] outline-none"
                />
                <span className="text-[9px] text-[#444444] font-mono mt-1 block">
                  Available balance: {(userProfile?.credits || 0.0).toFixed(2)} CCR
                </span>
              </div>

              <div>
                <label className="text-[10px] font-medium text-[#444444] tracking-[0.8px] uppercase block mb-1">PRICE PER CREDIT (₹)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="1"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:border-[#22c55e] outline-none"
                />
              </div>

              <div className="bg-[#141414] border border-[#1a1a1a] rounded-xl p-3 text-xs font-mono flex justify-between">
                <span className="text-[#444444]">ESTIMATED VALUE:</span>
                <span className="text-white font-bold">
                  ₹{(sellQty * sellPrice).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 bg-[#141414] hover:bg-[#1e1e1e] border border-[#1a1a1a] text-[#888888] rounded-xl py-2.5 text-xs font-medium uppercase transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#ef4444] hover:opacity-90 text-white font-semibold rounded-xl py-2.5 text-xs uppercase transition-all"
                >
                  PUBLISH LISTING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
