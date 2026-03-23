import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  ClipboardList, 
  Calendar, 
  Zap, 
  Activity,
  Brain,
  TrendingUp,
  MoreHorizontal,
  Layout,
  PieChart,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

const QuickActionCard = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-6 glass-card hover:bg-orange-500/10 hover:border-orange-500/30 transition-all text-center group"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-orange-500 transition-colors">
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{label}</span>
  </motion.button>
);

const InsightItem = ({ label, value, trend, trendUp }) => (
  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center justify-between">
      <p className="text-lg font-black text-white">{value}</p>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trendUp ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
        {trend}
      </div>
    </div>
  </div>
);

const formatTime12Hour = (time24) => {
  if (!time24) return "—";
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const AIAssistant = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Smart interface synchronized. I'm your Smart Life Assistant, ready to optimize your operational flow. How can I help you today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const [weatherData, setWeatherData] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Basic weather fetch for AI suggestions
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const data = await res.json();
          setWeatherData(data.current_weather);
        } catch (e) { console.error("Weather fetch failed for AI Assistant", e); }
      }, () => {});
    }
  }, []);

  const [insightData, setInsightData] = useState({
    peak: "19:00",
    fatigue: "Medium @ 3pm",
    streak: "0 Cycles",
    ratio: 0
  });

  useEffect(() => {
    const fetchAIAssistantData = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          api.get("/intelligence/summary"),
          api.get("/tasks?limit=500")
        ]);
        
        const allTasks = tasksRes.data?.tasks || [];
        const completed = allTasks.filter(t => t.completed);
        const ratio = allTasks.length > 0 ? (completed.length / allTasks.length) : 0;
        
        setInsightData({
          peak: "11:00 AM", // Mocked for now
          fatigue: ratio > 0.7 ? "Low @ 4pm" : "High @ 2pm",
          streak: `${completed.length} Tasks`,
          ratio: ratio
        });
      } catch (error) {
        console.error("AI Assistant Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAIAssistantData();
  }, []);

  const handleSend = async (overrideInput) => {
    const messageText = overrideInput || input;
    if (!messageText.trim()) return;

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.post("/ai/chat", { 
        message: messageText,
        weatherData: weatherData
      });
      
      // Simulate thinking time for premium feel
      setTimeout(() => {
        const assistantMessage = {
          role: "assistant",
          content: response.data.reply || "Optimization complete. Is there anything else I can assist with?",
          actions: response.data.actions || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);

        if (response.data.actions?.length > 0 || response.data.reply.toLowerCase().includes("rescheduled") || response.data.reply.toLowerCase().includes("marked as complete")) {
          window.dispatchEvent(new Event("tasksUpdated"));
          
          // Handle navigation actions
          const navAction = response.data.actions?.find(a => a.type === "navigation");
          if (navAction) {
            setTimeout(() => {
              navigate(navAction.path);
            }, 1200);
          }
        }
      }, 1000);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Signal interference detected. Please re-transmit your command." },
      ]);
      setIsTyping(false);
    }
  };

  if (loading) return <div className="min-h-screen pl-[84px] flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-24 page-transition">
      {/* Lighting FX */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-white">
              Smart Control Center
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">Advanced Intelligence Node</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
           <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        
        {/* ── Left Column: Chat Area ──────────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4 space-y-8 custom-scrollbar min-h-[500px]">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] flex gap-5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
                      msg.role === "user" ? "bg-white/5 border-white/10" : "bg-orange-500/10 border-orange-500/20 shadow-orange-500/5"
                    }`}>
                      {msg.role === "user" ? <User size={22} className="text-gray-400" /> : <Bot size={22} className="text-orange-500" />}
                    </div>
                    <div className={`p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed shadow-2xl ${
                      msg.role === "user" 
                        ? "user-bubble text-white border border-orange-500/20 rounded-tr-none" 
                        : "ai-bubble text-white border border-white/5 rounded-tl-none"
                    }`}>
                      {msg.content}

                      {/* Categorized Schedule UI */}
                      {msg.actions?.find(a => a.type === "categorized_schedule") && (() => {
                        const action = msg.actions.find(a => a.type === "categorized_schedule");
                        return (
                          <div className="mt-6 space-y-6 pt-6 border-t border-white/10">
                            {/* COMPLETED */}
                            <div>
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <CheckCircle size={12} /> Operational Milestones Achieved
                              </p>
                              <div className="space-y-2">
                                {action.completed?.length > 0 ? (
                                  action.completed.map((t, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs font-bold text-emerald-200/70 line-through">
                                      {t.title}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">No tasks completed yet today.</div>
                                )}
                              </div>
                            </div>

                            {/* MISSED */}
                            <div>
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertCircle size={12} /> Prioritized Rescheduling (Missed)
                              </p>
                              <div className="space-y-2">
                                {action.missed?.length > 0 ? (
                                  action.missed.map((t, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 group/item">
                                      <div className="w-16 text-[10px] font-black text-rose-400">{t.timeRange?.split(' - ')[0] || "??:??"}</div>
                                      <div className="flex-1 text-xs font-bold text-white">{t.title}</div>
                                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">No missed tasks detected. Operational flow is healthy.</div>
                                )}
                              </div>
                            </div>

                            {/* UPCOMING / PENDING */}
                            <div>
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock size={12} /> Optimized Operational Flow
                              </p>
                              <div className="space-y-2">
                                {action.pending?.length > 0 ? (
                                  action.pending.map((t, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item">
                                      <div className="w-16 text-[10px] font-black text-gray-400 group-hover/item:text-orange-400">{t.timeRange?.split(' - ')[0] || "??:??"}</div>
                                      <div className="flex-1 text-xs font-bold text-white">{t.title}</div>
                                      {t.title?.toLowerCase().includes('break') && <div className="w-2 h-2 rounded-full bg-emerald-500/50" />}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">No pending tasks for the remainder of the day.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Render Task List if available */}
                      {msg.actions && msg.actions.length > 0 && msg.actions.some(a => a.type === "task_list") && (
                        <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Active Task List</p>
                          {msg.actions.filter(a => a.type === "task_list").map((action, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 group/item hover:bg-white/10 transition-all">
                              <div className="w-16 text-[10px] font-black text-gray-500 group-hover/item:text-orange-400 transition-colors">{formatTime12Hour(action.time)}</div>
                              <div className="flex-1 text-xs font-bold text-white">{action.title}</div>
                              <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                                action.priority === 'High' ? 'text-rose-400 border-rose-500/20' : 
                                action.priority === 'Medium' ? 'text-amber-400 border-amber-500/20' : 
                                'text-emerald-400 border-emerald-500/20'
                              }`}>
                                {action.priority}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <Bot size={22} className="text-orange-500" />
                    </div>
                    <div className="px-8 py-5 ai-bubble rounded-[2.5rem] rounded-tl-none flex gap-2">
                      <span className="w-2 h-2 bg-orange-500/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-orange-500/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-orange-500/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="glass-card p-2.5 flex items-center gap-4 border border-white/10 shadow-2xl mt-auto">
            <input 
              type="text" 
              placeholder="Transmit command..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-medium text-white placeholder:text-gray-600"
            />
            <button 
              onClick={() => handleSend()}
              className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all ripple"
            >
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* ── Right Column: Insights & Actions ────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
               <Zap size={14} className="text-orange-500" />
               Quick Commands
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard icon={ClipboardList} label="Plan Day" onClick={() => handleSend("Analyze my load and plan my day for maximum focus")} />
              <QuickActionCard icon={Calendar} label="Optimize" onClick={() => handleSend("Reschedule my missed tasks to better times")} />
              <QuickActionCard icon={Zap} label="Boost" onClick={() => handleSend("Give me a productivity boost tip")} />
              <QuickActionCard icon={Brain} label="Review" onClick={() => handleSend("Review my weekly operational performance")} />
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] -z-10 group-hover:bg-orange-500/10 transition-all" />
            
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Sparkles size={14} className="text-orange-500" />
                 Smart Insights
              </h3>
              <MoreHorizontal size={16} className="text-gray-700" />
            </div>

            <div className="space-y-4">
              <InsightItem label="Peak Productivity" value={insightData.peak} trend="+12%" trendUp={true} />
              <InsightItem label="Cognitive Fatigue" value={insightData.fatigue} trend={insightData.ratio > 0.5 ? "-4%" : "+8%"} trendUp={insightData.ratio > 0.5} />
              <InsightItem label="Operational Volume" value={insightData.streak} trend={`+${Math.round(insightData.ratio * 100)}%`} trendUp={true} />
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
               <p className="text-xs text-gray-400 leading-relaxed italic">
                 {insightData.ratio > 0.7 
                   ? "Operational patterns suggest peak synchronization. Your focus windows are perfectly aligned 🔥" 
                   : insightData.ratio > 0.4
                   ? "System load is stabilizing. Maintain current momentum to secure weekly targets."
                   : "Analyzing performance gaps. I recommend shifting high-priority tasks to earlier slots."}
               </p>
            </div>
          </div>

          {/* Mini Progress Card */}
          <div className="glass-card p-6 flex items-center gap-6">
             <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none" strokeWidth="6" />
                  <motion.circle 
                    cx="32" cy="32" r="28" 
                    className="stroke-orange-500 fill-none" 
                    strokeWidth="6" 
                    strokeDasharray="176" 
                    initial={{ strokeDashoffset: 176 }}
                    animate={{ strokeDashoffset: 176 - (insightData.ratio * 176) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{Math.round(insightData.ratio * 100)}%</div>
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Sync</p>
                <p className="text-sm font-black text-white">{insightData.ratio > 0.7 ? "Flow Target Achieved" : "Synchronizing Node..."}</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIAssistant;