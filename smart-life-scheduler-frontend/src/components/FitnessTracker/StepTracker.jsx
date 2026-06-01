import React, { useState } from "react";
import api from "../../api";
import { Activity } from "lucide-react";

export default function StepTracker({ steps, dateStr, onUpdate }) {
  const [newSteps, setNewSteps] = useState("");

  const logSteps = async () => {
    if (!newSteps) return;
    try {
      await api.post('/fitness/steps', { steps: parseInt(newSteps), date: dateStr });
      setNewSteps("");
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card w-full max-w-full overflow-hidden p-5 sm:p-6 md:p-8 flex flex-col flex-1 border border-white/5 bg-white/[0.02] relative group">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Activity size={16} className="text-yellow-400" /> Steps
      </h4>
      
      {steps ? (
        <div className="flex items-center gap-3 p-2">
          <span className="text-3xl font-black text-white tracking-tighter">{steps}</span>
          <span className="text-yellow-500 font-black uppercase tracking-wide">steps</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Count" 
            value={newSteps}
            onChange={e => setNewSteps(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
          />
          <button onClick={logSteps} className="px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-black rounded-xl hover:bg-yellow-500/40 uppercase tracking-wide">Log</button>
        </div>
      )}
    </div>
  );
}
