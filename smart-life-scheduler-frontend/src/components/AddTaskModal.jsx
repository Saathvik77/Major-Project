import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Briefcase } from 'lucide-react';
import api from '../api';

export default function AddTaskModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post("/tasks", {
        title,
        description: "Created via Quick Add",
        date: selectedDate,
        duration: 60,
        priority: "Medium",
        deadline: selectedDate,
        startTime: startTime || "09:00"
      });

      window.dispatchEvent(new Event("tasksUpdated"));
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(e => console.error("Audio playback error:", e));

      setTitle("");
      setStartTime("");
      onClose();
    } catch (err) {
      console.error("Quick Add task error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-slate-800/90 backdrop-blur-xl border border-white/10 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primaryTeal/20 rounded-full blur-[40px] -z-10 pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondaryCyan to-primaryTeal flex items-center justify-center text-white shadow-[0_0_15px_rgba(45,212,191,0.4)]">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">New Task</h2>
              <p className="text-xs text-teal-300 font-medium tracking-wide uppercase">Quick Add</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Task Title Input */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="What do you need to do?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-sm font-medium"
              autoFocus
            />
            <Plus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Input */}
            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                 <Calendar size={12} className="text-cyan-400" />
                 Date
               </label>
               <input
                 type="date"
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all text-sm font-medium appearance-none"
               />
            </div>

            {/* Time Input */}
             <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                 <Clock size={12} className="text-cyan-400" />
                 Time
               </label>
               <input
                 type="time"
                 value={startTime}
                 onChange={(e) => setStartTime(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 transition-all text-sm font-medium appearance-none"
               />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="mt-2 w-full bg-gradient-to-r from-secondaryCyan to-primaryTeal text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] active:scale-95 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2 tracking-wide"
          >
            {isSubmitting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 Add to Schedule
                 <Plus size={18} />
               </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
