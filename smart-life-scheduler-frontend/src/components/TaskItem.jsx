import { CheckCircle, AlertTriangle, ArrowUpCircle, MinusCircle, Clock, CalendarClock, Trash2 } from "lucide-react";
import React from 'react';

export default function TaskItem({ title, time, priority, icon: Icon, onClick, isExpired, isRescheduled, onReschedule, onComplete, onDelete }) {
  const priorityStyles = {
    high: 'text-white bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.4)] border border-red-500/50',
    medium: 'text-amber-100 bg-amber-500/30 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    low: 'text-emerald-100 bg-emerald-500/30 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    complete: 'text-white bg-teal-500/80 shadow-[0_0_10px_rgba(45,212,191,0.4)]',
  };

  const badgeStyle = priorityStyles[priority?.toLowerCase()] || priorityStyles.low;

  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-md border rounded-3xl p-4 shadow-lg flex items-center justify-between cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 mb-4 ${
        isExpired
          ? 'bg-red-500/5 border-red-500/25 hover:bg-red-500/10'
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`w-12 h-12 rounded-2xl border shadow-inner flex items-center justify-center flex-shrink-0 ${
          isExpired
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-white/5 border-white/5 text-primaryTeal'
        }`}>
          {Icon ? <Icon className="w-6 h-6" /> : <div className="w-6 h-6 bg-teal-500/30 rounded-full" />}
        </div>
        <div className="min-w-0">
          <h4 className={`font-semibold text-[17px] tracking-wide truncate ${isExpired ? 'text-red-200' : 'text-gray-100'}`}>
            {title}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isExpired ? (
              <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                <Clock size={11} />
                Expired · was {time}
              </span>
            ) : isRescheduled ? (
              <span className="flex items-center gap-1 text-teal-300 text-xs font-semibold">
                <CalendarClock size={11} />
                Rescheduled · {time}
              </span>
            ) : (
              <p className="text-gray-400 text-sm font-medium">{time}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {isExpired && (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-red-200 bg-red-500/20 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            Expired
          </span>
        )}
        {isRescheduled && !isExpired && (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide text-teal-200 bg-teal-500/20 border border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.2)]">
            Rescheduled
          </span>
        )}
        {!isExpired && priority && priority.toLowerCase() !== 'medium' && (
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${badgeStyle}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {onReschedule && (
          <button
            onClick={(e) => { e.stopPropagation(); onReschedule(); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 ${
              isExpired
                ? 'text-orange-400 bg-orange-500/15 border border-orange-500/30'
                : 'text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20'
            }`}
          >
            <CalendarClock size={14} />
            <span className="hidden sm:inline">Reschedule</span>
          </button>
        )}
        
        {onComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className="text-emerald-500 hover:text-emerald-400 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
            title="Mark as Done"
          >
            <CheckCircle size={18} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all"
            title="Delete Task"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
