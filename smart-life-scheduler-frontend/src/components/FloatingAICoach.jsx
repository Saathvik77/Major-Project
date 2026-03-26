import { useState, useEffect, useRef, useContext } from "react";
import { Send, Bot, User, Sparkles, X, MessageSquareHeart, Zap, Calendar, Dumbbell, ListChecks, Award, CheckCircle, AlertCircle, Clock, TrendingUp, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import { ThemeContext } from "../ThemeContext";

// Quick-action suggestion chips
const QUICK_CHIPS = [
  { label: "Plan my day", icon: <Calendar size={12} /> },
  { label: "My tasks", icon: <ListChecks size={12} /> },
  { label: "Review", icon: <Zap size={12} /> },
  { label: "Productivity?", icon: <TrendingUp size={12} /> },
];

function FloatingAICoach({ weatherData, tasks, stats, userName }) {
  const navigate = useNavigate();
  const { setAppTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Hide pulse ring after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  // Initial Greeting & Suggestions on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setIsTyping(true);

      const pendingCount = tasks?.filter((t) => !t.completed).length || 0;
      let weatherContext = "";

      if (weatherData) {
        const temp = weatherData.temperature;
        const code = weatherData.weathercode;
        if (code <= 2 && temp >= 10 && temp <= 32) weatherContext = "• Weather is perfect for an outdoor run today 🏃‍♂️";
        else if (code >= 51) weatherContext = "• Looks rainy, good time for deep indoor work 🌧️";
        else if (temp < 10 || (code >= 71 && code <= 77)) weatherContext = "• It's chilly out! Stay warm with some indoor stretching ❄️";
        else weatherContext = "• Mild weather, great for a brisk walk 🌤️";
      }

      const suggestionText = `Hello ${userName || "User"} 👋\n\nToday's suggestions:\n• Drink 500ml more water 💧\n• Complete ${pendingCount} pending tasks 📝\n${weatherContext}`;

      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: 1, type: "bot", text: suggestionText }]);
      }, 1500);
    }
  }, [isOpen, hasOpened, weatherData, tasks]);

  const addBotMessage = (text, actions = []) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), type: "bot", text, actions }]);
  };

  const handleCommand = async (userInput) => {
    try {
      // Small local bypass for UI themes
      const text = userInput.toLowerCase();
      if (text.includes("tired") || text.includes("stress") || text.includes("calm") || text.includes("relax")) {
        addBotMessage("I see you're tired. Let's slow things down...\n\nSwitching to Calm Mode 🌙");
        setTimeout(() => setAppTheme("calm"), 1500);
        return;
      }

      const response = await api.post("/ai/chat", { 
        message: userInput,
        weatherData: weatherData
      });

      addBotMessage(response.data.reply, response.data.actions || []);
      
      if (response.data.actions?.length > 0) {
        window.dispatchEvent(new Event("tasksUpdated"));
        
        // Handle navigation actions (with safety guard for productivity queries)
        const navAction = response.data.actions.find(a => a.type === "navigation" || a.type === "NAVIGATION");
        const isProductivityQuery = ["productivity", "report", "review", "performance"].some(k => userInput.toLowerCase().includes(k));
        
        if (navAction && !isProductivityQuery) {
          setTimeout(() => navigate(navAction.path || navAction.data?.path), 1200);
        }
      }
    } catch (error) {
      console.error(error);
      addBotMessage("Oops, I lost connection to the database. Something went wrong on my end! 🔌");
    }
  };

  const handleSend = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { id: Date.now(), type: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      handleCommand(userText);
    }, 1200);
  };

  return (
    <div className="fixed bottom-36 md:bottom-10 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window Popup ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.88, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[410px] h-[530px] flex flex-col overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] relative"
            style={{ background: "linear-gradient(145deg, rgba(5,8,15,0.98) 0%, rgba(2,4,10,0.99) 100%)", backdropFilter: "blur(24px)" }}
          >
            {/* Subtle top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-lime-500/50 to-transparent" />

            {/* ── Chat Header ─────────────────────────────────────── */}
            <div className="relative px-5 py-4 border-b border-white/[0.07] overflow-hidden flex-shrink-0">
              {/* Animated gradient header bg */}
              <div className="absolute inset-0 bg-gradient-to-r from-lime-600/20 via-emerald-600/15 to-yellow-600/10 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,204,22,0.18),transparent_60%)] pointer-events-none" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* AI avatar with pulse ring */}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lime-500 via-emerald-500 to-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.5)]">
                      <Bot size={20} className="text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-wide flex items-center gap-1.5">
                      AI Coach
                      <Sparkles size={13} className="text-lime-400 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Online & Ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Messages Area ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex items-end gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.type === "bot"
                        ? "bg-gradient-to-br from-lime-500 to-emerald-600 shadow-[0_0_10px_rgba(132,204,22,0.4)]"
                        : "bg-slate-700 border border-white/10"
                        }`}
                    >
                      {msg.type === "bot" ? (
                        <Bot size={13} className="text-white" />
                      ) : (
                        <User size={13} className="text-gray-300" />
                      )}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${msg.type === "bot"
                        ? "bg-white/[0.07] border border-white/[0.08] text-gray-200 rounded-bl-none shadow-lg"
                        : "bg-gradient-to-br from-lime-600 to-emerald-600 text-white rounded-br-none shadow-md shadow-lime-500/20"
                        }`}
                    >
                      <p className="text-[13.5px] leading-relaxed whitespace-pre-line font-medium mb-4">{msg.text}</p>
                      
                      {msg.actions?.find(a => a.type === "comprehensive_report") && (() => {
                        const action = msg.actions.find(a => a.type === "comprehensive_report");
                        return (
                          <div className="space-y-4 pt-3 border-t border-white/10 mt-3">
                             {/* Performance Score & Suggestion */}
                             <div className="flex items-center justify-between p-3 rounded-xl bg-lime-500/10 border border-lime-500/20">
                                <div>
                                   <p className="text-[8px] font-black text-lime-500/60 uppercase tracking-widest">Efficiency Index</p>
                                   <h4 className="text-xl font-black text-white">{action.efficiency}%</h4>
                                </div>
                                <TrendingUp size={16} className="text-lime-500" />
                             </div>

                             <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                   <Brain size={10} className="text-lime-500" /> Recommendation
                                </p>
                                <p className="text-[11px] font-medium text-white/80 italic leading-snug">
                                   "{action.suggestion}"
                                </p>
                             </div>

                             {/* COMPLETED */}
                             {action.completed?.length > 0 && (
                               <div>
                                 <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                   <Award size={10} /> Milestones
                                 </p>
                                 <div className="space-y-1.5">
                                    {action.completed.slice(0, 3).map((t, idx) => (
                                      <div key={idx} className="px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-bold text-emerald-100/80 flex justify-between">
                                         <span>{t.title}</span>
                                      </div>
                                    ))}
                                 </div>
                               </div>
                             )}

                             {/* MISSED */}
                             {action.missed?.length > 0 && (
                               <div>
                                 <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                   <AlertCircle size={10} /> Overdue
                                 </p>
                                 <div className="space-y-1.5">
                                    {action.missed.slice(0, 3).map((t, idx) => (
                                      <div key={idx} className="px-3 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[11px] font-bold text-rose-100/80">
                                         {t.title}
                                      </div>
                                    ))}
                                 </div>
                               </div>
                             )}

                             {/* RESCHEDULED */}
                             {action.rescheduled?.length > 0 && (
                               <div>
                                 <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                   <Zap size={10} /> Re-optimized
                                 </p>
                                 <div className="space-y-1.5">
                                    {action.rescheduled.slice(0, 3).map((t, idx) => (
                                      <div key={idx} className="px-3 py-2 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-[11px] font-bold text-yellow-100/80 flex justify-between">
                                         <span>{t.title}</span>
                                         <span className="text-[8px] opacity-60 uppercase">{t.count}x</span>
                                      </div>
                                    ))}
                                 </div>
                               </div>
                             )}
                          </div>
                        );
                      })()}

                      {/* Categorized Schedule UI (Compact) */}
                      {msg.actions?.find(a => a.type === "categorized_schedule") && (() => {
                        const action = msg.actions.find(a => a.type === "categorized_schedule");
                        return (
                          <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
                             {action.pending?.length > 0 && (
                               <div>
                                 <p className="text-[9px] font-black text-lime-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                   <Clock size={10} /> Optimized Flow
                                 </p>
                                 <div className="space-y-1.5">
                                    {action.pending.slice(0, 3).map((t, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                                         <div className="text-[9px] font-black text-gray-400">{t.timeRange?.split(' - ')[0] || "??:??"}</div>
                                         <div className="flex-1 text-[11px] font-bold text-white truncate">{t.title}</div>
                                      </div>
                                    ))}
                                 </div>
                               </div>
                             )}
                          </div>
                        );
                      })()}

                      {/* Recommendations UI (Compact) */}
                      {msg.actions?.find(a => a.type === "recommendations") && (() => {
                        const action = msg.actions.find(a => a.type === "recommendations");
                        return (
                          <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                            <p className="text-[9px] font-black text-lime-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Sparkles size={10} /> Suggestions
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {action.links.slice(0, 2).map((link, idx) => (
                                <a 
                                  key={idx} 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/link"
                                >
                                  <span className="text-[11px] font-bold text-white/90 truncate">{link.title}</span>
                                  <TrendingUp size={12} className="text-lime-500 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action Feedback (Compact) */}
                      {msg.actions && msg.actions.length > 0 && msg.actions.some(a => ['task_created', 'task_updated', 'task_deleted'].includes(a.type)) && (
                        <div className="mt-4 space-y-1.5 pt-3 border-t border-white/10">
                          {msg.actions.map((action, idx) => {
                             if (action.type === 'task_created') return (
                               <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-lime-500/10 border border-lime-500/20 text-[9px] font-bold text-lime-400">
                                 <CheckCircle size={12} /> {action.title} Logged
                               </div>
                             );
                             if (action.type === 'task_updated') return (
                               <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-bold text-yellow-400">
                                 <TrendingUp size={12} /> {action.title} Synchronized
                               </div>
                             );
                             if (action.type === 'task_deleted') return (
                               <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-400">
                                 <AlertCircle size={12} /> {action.title} Terminated
                               </div>
                             );
                             return null;
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 shadow-[0_0_10px_rgba(132,204,22,0.4)] flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="bg-white/[0.07] border border-white/[0.08] rounded-2xl rounded-bl-none px-4 py-3.5 shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Action Chips ───────────────────────────────── */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.10] rounded-full text-[11px] font-semibold text-gray-300 hover:bg-lime-500/20 hover:border-lime-500/40 hover:text-white transition-all duration-200"
                  >
                    {chip.icon}
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input Area ────────────────────────────────────────── */}
            <div className="p-4 border-t border-white/[0.07] flex-shrink-0" style={{ background: "rgba(4,6,10,0.8)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-1.5 pl-4 focus-within:bg-white/[0.07] focus-within:border-lime-500/30 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Ask AI Coach anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isTyping}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 font-medium text-[13px] disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-lime-400 hover:to-emerald-500 transition-all duration-200 shadow-[0_0_12px_rgba(132,204,22,0.4)] hover:shadow-[0_0_18px_rgba(132,204,22,0.6)] hover:scale-105 active:scale-95"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Toggle Button ───────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className={`relative flex items-center gap-2 bg-gradient-to-r from-lime-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(132,204,22,0.35)] hover:shadow-[0_0_28px_rgba(132,204,22,0.55)] font-black text-xs uppercase tracking-widest z-50 transition-all duration-300 ${isOpen ? "opacity-0 scale-90 pointer-events-none absolute" : "opacity-100 scale-100"
          }`}
      >
        {/* Pulse ring when not opened yet */}
        {showPulse && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-lime-500 opacity-20 pointer-events-none" />
        )}
        <MessageSquareHeart size={16} />
        {/* Removed text if it's too big, or kept it very short */}
        AI Coach
        <Sparkles size={11} className="text-lime-300" />
      </motion.button>
    </div>
  );
}

export default FloatingAICoach;
