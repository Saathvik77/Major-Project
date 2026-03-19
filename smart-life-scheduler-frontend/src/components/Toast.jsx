import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-500" />,
    error: <AlertCircle size={16} className="text-rose-500" />,
    info: <Info size={16} className="text-blue-500" />,
    sparkle: <Sparkles size={16} className="text-amber-500" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300]"
    >
      <div className="glass-morphism px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shadow-2xl backdrop-blur-xl">
        {icons[type] || icons.success}
        <span className="text-sm font-bold text-white tracking-tight">{message}</span>
      </div>
    </motion.div>
  );
}
