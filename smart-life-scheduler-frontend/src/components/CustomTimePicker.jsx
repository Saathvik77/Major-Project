import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Check } from "lucide-react";

export default function CustomTimePicker({ isOpen, onClose, initialTime, onSelect }) {
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  useEffect(() => {
    if (initialTime && initialTime.includes(":")) {
      const [h24, m] = initialTime.split(":");
      const hInt = parseInt(h24, 10);
      const h12 = hInt % 12 || 12;
      setHour(String(h12).padStart(2, "0"));
      setMinute(m);
      setPeriod(hInt >= 12 ? "PM" : "AM");
    }
  }, [initialTime, isOpen]);

  const handleApply = () => {
    let h24 = parseInt(hour, 10);
    if (period === "PM" && h24 < 12) h24 += 12;
    if (period === "AM" && h24 === 12) h24 = 0;
    
    const time24 = `${String(h24).padStart(2, "0")}:${minute}`;
    onSelect(time24);
    onClose();
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")); // 5-min intervals for better UX

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm glass-morphism rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-[301] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">Set Time</h3>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 h-64">
                {/* Hour Column */}
                <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto custom-scrollbar h-full py-20">
                  {hours.map(h => (
                    <button
                      key={h}
                      onClick={() => setHour(h)}
                      className={`text-2xl font-black transition-all ${
                        hour === h ? "text-lime-500 scale-125" : "text-gray-600 scale-100 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>

                <span className="text-4xl font-black text-white/10 mb-2">:</span>

                {/* Minute Column */}
                <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto custom-scrollbar h-full py-20">
                  {minutes.map(m => (
                    <button
                      key={m}
                      onClick={() => setMinute(m)}
                      className={`text-2xl font-black transition-all ${
                        minute === m ? "text-lime-500 scale-125" : "text-gray-600 scale-100 opacity-40 hover:opacity-100"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Period Toggle */}
                <div className="flex flex-col gap-4 ml-4">
                  {["AM", "PM"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                        period === p 
                          ? "bg-lime-500 text-white border-lime-500 shadow-lg shadow-lime-500/20" 
                          : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleApply}
                  className="flex-1 py-4 rounded-2xl bg-lime-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-lime-500/20 flex items-center justify-center gap-3 hover:bg-lime-600 transition-all"
                >
                  <Check size={18} />
                  Confirm sync
                </button>
              </div>
            </div>
            
            {/* Visual Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 rounded-full blur-[60px] -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime-500/5 rounded-full blur-[60px] -z-10" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
