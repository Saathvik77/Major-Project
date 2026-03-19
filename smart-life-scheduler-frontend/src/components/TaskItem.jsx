import { CheckCircle, Clock, ChevronDown, Timer } from "lucide-react";
import React from 'react';

export default function TaskItem({ title, time, priority, onComplete, isExpired }) {
  if (isExpired) return null; // Handled separately in Tasks.jsx for different layout

  return (
    <div className="group backdrop-blur-md bg-white/[0.04] border border-white/5 rounded-[2rem] p-4 flex items-center justify-between transition-all hover:bg-white/[0.08] hover:border-white/10 cursor-pointer shadow-lg">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all group-hover:border-cyan-400/20"
        >
          <CheckCircle size={20} />
        </button>
        <div className="min-w-0">
          <h4 className="text-base font-bold text-white tracking-tight truncate">{title}</h4>
          <p className="text-gray-500 text-xs font-medium flex items-center gap-1.5 mt-0.5">
            <Timer size={12} className="text-gray-600" /> {time}
          </p>
        </div>
      </div>
      
      <div className="sm:flex items-center gap-3 hidden">
        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{priority || "Work"}</span>
          <ChevronDown size={14} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
}
