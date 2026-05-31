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
    <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex-1">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Scale size={16} className="text-emerald-400" /> Weight
      </h4>
      
      {weight ? (
        <div className="flex items-center gap-3 p-2">
          <span className="text-3xl font-black text-white tracking-tighter">{weight}</span>
          <span className="text-emerald-500 font-black uppercase tracking-wide">kg</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="kg" 
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
          />
          <button onClick={logWeight} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black rounded-xl hover:bg-emerald-500/40 uppercase tracking-wide">Log</button>
        </div>
      )}
    </div>
  );
}
