import React, { useState } from "react";
import api from "../../api";
import { Moon } from "lucide-react";

export default function SleepTracker({ sleepLog, dateStr, onUpdate }) {
  const [sleepTime, setSleepTime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");

  const logSleep = async () => {
    try {
      let sh = parseInt(sleepTime.split(':')[0]);
      let sm = parseInt(sleepTime.split(':')[1]);
      let wh = parseInt(wakeTime.split(':')[0]);
      let wm = parseInt(wakeTime.split(':')[1]);
      
      let sleepMinutes = (wh * 60 + wm) - (sh * 60 + sm);
      if (sleepMinutes < 0) sleepMinutes += 24 * 60; // crossed midnight
      
      const duration = (sleepMinutes / 60).toFixed(1);

      await api.post('/fitness/sleep', { sleepTime, wakeTime, duration, date: dateStr });
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card w-full max-w-full overflow-hidden p-5 sm:p-6 md:p-8 flex flex-col flex-1 border border-white/5 bg-white/[0.02] relative group">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Moon size={16} className="text-indigo-400" /> Sleep Log
      </h4>
      
      {sleepLog ? (
        <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
          <div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-wide">Duration</p>
            <p className="text-2xl font-black text-white">{sleepLog.duration}h</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400">{sleepLog.sleepTime} - {sleepLog.wakeTime}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-500 uppercase">Sleep</label>
              <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-500 uppercase">Wake</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white" />
            </div>
          </div>
          <button onClick={logSleep} className="w-full py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black rounded-xl hover:bg-indigo-500/40 uppercase tracking-wide">Log Sleep</button>
        </div>
      )}
    </div>
  );
}
