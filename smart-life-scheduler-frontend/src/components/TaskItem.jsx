import { CheckCircle, AlertTriangle, ArrowUpCircle, MinusCircle } from "lucide-react";
import React from 'react';

export default function TaskItem({ title, time, priority, icon: Icon, onClick }) {
  const priorityStyles = {
    high: 'text-white bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    low: 'text-emerald-100 bg-emerald-500/30 border border-emerald-500/20',
    complete: 'text-white bg-teal-500/80 shadow-[0_0_10px_rgba(45,212,191,0.4)]',
  };

  const badgeStyle = priorityStyles[priority?.toLowerCase()] || priorityStyles.low;

  return (
    <div 
      onClick={onClick}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all hover:shadow-xl hover:-translate-y-0.5 mb-4"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 shadow-inner flex items-center justify-center text-primaryTeal">
          {Icon ? <Icon className="w-6 h-6" /> : <div className="w-6 h-6 bg-teal-500/30 rounded-full" />}
        </div>
        <div>
          <h4 className="text-gray-100 font-semibold text-[17px] tracking-wide">{title}</h4>
          <p className="text-gray-400 text-sm mt-0.5 font-medium">{time}</p>
        </div>
      </div>
      <div>
        {priority && priority.toLowerCase() !== 'medium' && (
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${badgeStyle}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}
