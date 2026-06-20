import React, { useState } from 'react';
import { useTripHistory } from '../hooks/useTripHistory';

export default function History() {
  const { trips } = useTripHistory();
  const [selectedTrip, setSelectedTrip] = useState(null);

  return (
    <div className="flex flex-col gap-6 text-[#888888] pb-12 selection:bg-[#22c55e] selection:text-[#070708]">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-light text-white tracking-tight">Trip History Log</h2>
        <p className="text-xs text-[#6b6b7a] mt-1">Review your macro trip duration logs, distances, and scores</p>
      </div>

      {/* Trips list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <div 
              key={trip.trip_id}
              onClick={() => setSelectedTrip(trip)}
              className="bg-[#131316] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(34,197,94,0.2)] rounded-xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all shadow-md flex flex-col gap-4"
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-[#6b6b7a] uppercase">
                <span>Trip ID: {trip.trip_id}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  trip.status === 'ECO' ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'
                }`}>{trip.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#6b6b7a] block uppercase text-[8px] font-semibold tracking-wider">Distance</span>
                  <span className="text-white font-mono text-sm">{trip.distance_km} km</span>
                </div>
                <div>
                  <span className="text-[#6b6b7a] block uppercase text-[8px] font-semibold tracking-wider">Duration</span>
                  <span className="text-white font-mono text-sm">{trip.duration_min} min</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#6b6b7a] block uppercase text-[8px] font-semibold tracking-wider">Total CO₂</span>
                  <span className="text-[#ef4444] font-mono text-sm">{trip.total_co2_g} g</span>
                </div>
                <div className="mt-2">
                  <span className="text-[#6b6b7a] block uppercase text-[8px] font-semibold tracking-wider">Eco Score</span>
                  <span className="text-[#22c55e] font-mono text-sm">{trip.eco_score}</span>
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.03)] pt-2.5 flex items-center justify-between text-[10px] text-[#6b6b7a]">
                <span>Harsh events: {trip.harsh_count}</span>
                <span className="text-[#22c55e] hover:underline flex items-center gap-1">Inspect Details <i className="ti ti-arrow-right"></i></span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-xs text-[#3a3a45] py-16 bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-xl">
            No completed trips recorded in database yet.
          </div>
        )}
      </div>

      {/* Slide-out details drawer/modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[999] flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-[420px] h-full bg-[#0e0e10] border-l border-[rgba(255,255,255,0.06)] p-6 flex flex-col justify-between shadow-2xl relative">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-[#131316] border border-[rgba(255,255,255,0.06)] rounded-full flex items-center justify-center text-[#6b6b7a] hover:text-white"
            >
              <i className="ti ti-x"></i>
            </button>

            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              <div>
                <span className="text-[9px] font-semibold text-[#22c55e] tracking-widest uppercase block font-mono">Trip Details Log</span>
                <h3 className="text-lg font-light text-white mt-1">Trip ID: {selectedTrip.trip_id}</h3>
                <span className="text-[11px] text-[#6b6b7a] font-mono block mt-1">{new Date(selectedTrip.created_at || Date.now()).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#131316] border border-[rgba(255,255,255,0.04)] p-4 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[#6b6b7a] block text-[9px] uppercase font-semibold">Distance</span>
                  <span className="text-white text-sm font-semibold">{selectedTrip.distance_km} km</span>
                </div>
                <div>
                  <span className="text-[#6b6b7a] block text-[9px] uppercase font-semibold">Duration</span>
                  <span className="text-white text-sm font-semibold">{selectedTrip.duration_min} mins</span>
                </div>
                <div>
                  <span className="text-[#6b6b7a] block text-[9px] uppercase font-semibold">Avg Speed</span>
                  <span className="text-white text-sm font-semibold">{selectedTrip.avg_speed} km/h</span>
                </div>
                <div>
                  <span className="text-[#6b6b7a] block text-[9px] uppercase font-semibold">Total Emission</span>
                  <span className="text-[#ef4444] text-sm font-semibold">{selectedTrip.total_co2_g} g CO₂</span>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-[#6b6b7a] uppercase block mb-2">Driving suggestions</span>
                <div className="bg-[#131316]/50 border border-[rgba(34,197,94,0.12)] p-4 rounded-xl text-xs text-[#f1f1f3] italic leading-relaxed">
                  {selectedTrip.eco_score >= 80 
                    ? '"Excellent driving behavior! Maintain this eco score to qualify for further road tax reduction rewards."' 
                    : '"Smooth acceleration and early gear changes could improve your eco score, reducing emissions by up to 15%."'}
                </div>
              </div>

              {/* Micro specs */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-[#6b6b7a] uppercase block">Trip Metrics</span>
                <div className="flex justify-between text-xs py-2 border-b border-[rgba(255,255,255,0.03)] font-mono">
                  <span>Eco Rating:</span>
                  <span className="text-[#22c55e] font-bold">{selectedTrip.rank || 'Gold'}</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-[rgba(255,255,255,0.03)] font-mono">
                  <span>Harsh Braking/Accel:</span>
                  <span className="text-[#f59e0b] font-semibold">{selectedTrip.harsh_count} events</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-[rgba(255,255,255,0.03)] font-mono">
                  <span>Tax Reduction Benefit:</span>
                  <span className="text-[#22c55e] font-semibold">{selectedTrip.tax_status === 'eligible' ? 'Eligible' : 'Ineligible'}</span>
                </div>
              </div>

            </div>

            <button 
              onClick={() => setSelectedTrip(null)}
              className="w-full bg-[#131316] border border-[rgba(255,255,255,0.06)] hover:bg-[#18181c] text-[#f1f1f3] py-2.5 rounded-lg text-xs font-semibold mt-4 transition-colors"
            >
              Close inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
