import React from "react";
import api from "../../api";
import { Droplets } from "lucide-react";

export default function WaterTracker({ waterAmount, dateStr, onUpdate }) {
  const addWater = async (amount) => {
    try {
      await api.post('/fitness/water', { amount, date: dateStr });
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card p-6 border border-white/5 bg-white/[0.02]">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Droplets size={16} className="text-cyan-500" /> Water Intake
      </h4>
      
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="text-4xl font-black text-white tracking-tighter">
          {waterAmount.toFixed(1)} <span className="text-lg text-cyan-500">/ 3.0 L</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
          <div 
            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (waterAmount / 3.0) * 100)}%` }}
          />
        </div>
        <div className="flex gap-2 w-full mt-4">
          <button onClick={() => addWater(0.25)} className="flex-1 py-3 bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase tracking-wide rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">+250ml</button>
          <button onClick={() => addWater(0.5)} className="flex-1 py-3 bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase tracking-wide rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">+500ml</button>
          <button onClick={() => addWater(1.0)} className="flex-1 py-3 bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase tracking-wide rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">+1L</button>
        </div>
      </div>
    </div>
  );
}
