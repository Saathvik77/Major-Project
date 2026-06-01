import React, { useState } from "react";
import api from "../../api";
import { Scale } from "lucide-react";

export default function WeightTracker({ weight, dateStr, onUpdate }) {
  const [newWeight, setNewWeight] = useState("");

  const logWeight = async () => {
    if (!newWeight) return;
    try {
      await api.post('/fitness/weight', { weight: parseFloat(newWeight), date: dateStr });
      setNewWeight("");
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card w-full max-w-full overflow-hidden p-5 sm:p-6 md:p-8 flex flex-col flex-1 border border-white/5 bg-white/[0.02] relative group">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2 shrink-0">
        <Scale size={16} className="text-emerald-400" /> Weight
      </h4>
      
      {weight ? (
        <div className="flex items-center gap-3 p-2 shrink-0">
          <span className="text-3xl font-black text-white tracking-tighter">{weight}</span>
          <span className="text-emerald-500 font-black uppercase tracking-wide">kg</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full">
          <input 
            type="number" 
            placeholder="kg" 
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            className="flex-1 min-w-0 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none shrink-0"
          />
          <button onClick={logWeight} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black rounded-xl hover:bg-emerald-500/40 uppercase tracking-wide shrink-0 whitespace-nowrap">Log</button>
        </div>
      )}
    </div>
  );
}
