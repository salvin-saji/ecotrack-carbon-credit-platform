import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebase';

const Leaderboard = () => {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const res = await firebaseService.getLeaderboard();
        if (res) {
          setBoard(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadBoard();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 font-sans max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-[#1a1a1a] pb-4">
        <div className="w-10 h-10 bg-[#111111] border border-[#1a1a1a] rounded-xl flex items-center justify-center">
          <i className="ti ti-trophy text-white text-[20px]"></i>
        </div>
        <div>
          <h2 className="text-[16px] font-medium tracking-wider uppercase text-white font-display">LEADERBOARD</h2>
          <p className="text-[10px] font-mono text-[#444444] tracking-widest uppercase mt-0.5">Top eco-friendly drivers scoreboard rankings</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[#444444] border-b border-[#1a1a1a] text-[10px] font-medium tracking-[0.8px] uppercase">
                <th className="pb-3 w-16">RANK</th>
                <th className="pb-3">DRIVER</th>
                <th className="pb-3 text-right">ECO SCORE</th>
                <th className="pb-3 text-right">CREDITS EARNED</th>
              </tr>
            </thead>
            <tbody className="text-[#888888]">
              {board.map((item, idx) => (
                <tr key={idx} className="border-b border-[#141414] hover:bg-[#141414]/50 transition-all">
                  <td className="py-4 font-mono font-bold text-white flex items-center gap-2">
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : ''}
                    <span>{item.rank}</span>
                  </td>
                  <td className="py-4 font-medium text-white">{item.name}</td>
                  <td className="py-4 text-right font-mono text-[#22c55e] font-semibold">{item.ecoScore}</td>
                  <td className="py-4 text-right font-mono text-white">{item.creditsEarned.toFixed(1)} CCR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
