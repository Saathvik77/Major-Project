import React from "react";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAiPage = location.pathname === "/ai-assistant";

  return (
    <div className="flex bg-transparent min-h-screen overflow-hidden relative">
      <Sidebar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Global AI Icon */}
      {!isAiPage && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/ai-assistant')}
          className="fixed bottom-8 right-8 z-[500] group cursor-pointer"
        >
          <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 border border-white/20">
             <Bot size={28} strokeWidth={2.5} />
             <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={12} className="text-orange-500" />
             </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
             <p className="text-[10px] font-black text-white uppercase tracking-widest">Ask AI Assistant</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
