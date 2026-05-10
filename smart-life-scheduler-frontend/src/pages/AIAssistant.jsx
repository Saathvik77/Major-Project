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
  Clock,
  Award,
  Trophy,
  Star,
  Medal,
  Flame,
  Moon,
  Sun as SunIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

const QuickActionCard = ({ icon: Icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 glass-card hover:bg-lime-500/10 hover:border-lime-500/30 transition-all text-center group"
  >
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-lime-500 transition-colors">
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{label}</span>
  </motion.button>
);

const Badge = ({ icon: Icon, label, description, unlocked, color = "lime" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`relative group p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center text-center gap-2 ${
      unlocked 
        ? `bg-${color}-500/10 border-${color}-500/30 shadow-[0_0_20px_rgba(255,140,60,0.05)]` 
        : 'bg-white/[0.02] border-white/5 opacity-40 grayscale'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
      unlocked ? `text-${color}-500 bg-${color}-500/20` : 'text-gray-600 bg-white/5'
    }`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="space-y-0.5">
      <p className={`text-[9px] font-black uppercase tracking-widest ${unlocked ? 'text-white' : 'text-gray-500'}`}>{label}</p>
      <p className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter leading-none">{description}</p>
    </div>
    
    {unlocked && (
      <div className={`absolute inset-0 rounded-2xl bg-${color}-500/5 blur-xl group-hover:bg-${color}-500/10 transition-all -z-10`} />
    )}
  </motion.div>
);

const RecommendationCard = ({ link }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'video': return <TrendingUp size={14} className="text-red-400" />;
      case 'article': return <Activity size={14} className="text-blue-400" />;
      default: return <PieChart size={14} className="text-lime-400" />;
    }
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.08)" }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group/link"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-white/10 transition-all">
        {getIcon(link.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-white truncate">{link.title}</h5>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{link.type}</p>
      </div>
      <MoreHorizontal size={14} className="text-gray-600 group-hover/link:text-white transition-colors" />
    </motion.a>
  );
};

const AchievementVault = ({ ratio, tasks, stats }) => {
  const getRank = (r) => {
    if (r >= 1) return { title: "Nexus Grandmaster", color: "text-lime-500", glow: "shadow-lime-500/30" };
    if (r >= 0.8) return { title: "Operational Elite", color: "text-lime-400", glow: "shadow-lime-400/20" };
    if (r >= 0.5) return { title: "Strategic Specialist", color: "text-yellow-400", glow: "shadow-yellow-400/10" };
    return { title: "System Novice", color: "text-gray-400", glow: "" };
  };

  const rank = getRank(ratio);
  
  // Logic for badges
  const hasEarlyBird = tasks.some(t => t.completed && parseInt(t.startTime?.split(':')[0]) < 10);
  const hasFlowMaster = tasks.filter(t => t.completed).length >= 3;
  const hasNightOps = tasks.some(t => t.completed && parseInt(t.startTime?.split(':')[0]) >= 21);
  const hasPerfectSync = ratio === 1 && tasks.length > 0;

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group border-lime-500/20">
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end">
        <div className="px-2 py-0.5 bg-lime-500 text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest mb-1">
          Lvl {stats.level}
        </div>
        <div className="text-[8px] font-black text-lime-500/60 uppercase tracking-tighter">
          {stats.xp} XP
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-[40px] -z-10 group-hover:bg-lime-500/10 transition-all" />
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
           <Trophy size={14} className="text-lime-500" />
           Achievement Vault
        </h3>
        <Sparkles size={14} className="text-lime-500/40" />
      </div>

      <div className="text-center py-4 relative">
        <div className="absolute inset-0 bg-lime-500/5 blur-3xl rounded-full -z-10" />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Current Protocol Rank</p>
        <h4 className={`text-2xl font-black tracking-tighter uppercase ${rank.color} ${rank.glow}`}>
          {rank.title}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Badge icon={SunIcon} label="Early Bird" description="Pre-10AM Task" unlocked={hasEarlyBird} />
        <Badge icon={Flame} label="Flow Master" description="3+ Task Streak" unlocked={hasFlowMaster} />
        <Badge icon={Moon} label="Night Ops" description="Post-9PM Task" unlocked={hasNightOps} />
        <Badge icon={Medal} label="Perfect Sync" description="100% Day Clear" unlocked={hasPerfectSync} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
          <span>Rank Progression</span>
          <span>{Math.round(ratio * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            className="h-full bg-gradient-to-r from-lime-600 to-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.4)]"
          />
        </div>
      </div>
    </div>
  );
};
const AISuggestionsPanel = ({ suggestions }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
       <Sparkles size={14} className="text-cyan-400" />
       AI Neural Nudges
    </h3>
    <div className="space-y-3">
      {suggestions.map((suggestion, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
            <Zap size={12} className="text-cyan-400" />
          </div>
          <div className="flex gap-3">
            <div className={`p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0`}>
              {suggestion.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-white/90 leading-tight">{suggestion.text}</p>
              <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest mt-1">{suggestion.category}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DailyMissions = ({ missions }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
       <Trophy size={14} className="text-yellow-400" />
       Daily Missions
    </h3>
    <div className="space-y-3">
      {missions.map((mission, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="text-[10px] font-black text-white uppercase tracking-wider">{mission.title}</h5>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{mission.reward} XP</p>
            </div>
            <div className="text-[10px] font-black text-lime-400">{mission.progress}%</div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-lime-600 to-lime-400"
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        </div>
      ))}
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

  const [allTasks, setAllTasks] = useState([]);
  const [insightData, setInsightData] = useState({
    peak: "7:00 PM",
    fatigue: "Medium @ 3pm",
    streak: "0 Cycles",
    ratio: 0
  });

  const fetchAIAssistantData = async () => {
    try {
      const [summaryRes, tasksRes] = await Promise.all([
        api.get("/intelligence/summary"),
        api.get("/tasks?limit=500")
      ]);
      
      const tasks = tasksRes.data?.tasks || [];
      setAllTasks(tasks);
      const completed = tasks.filter(t => t.completed);
      const ratio = tasks.length > 0 ? (completed.length / tasks.length) : 0;
      
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

  const [suggestions] = useState([
    { icon: <Activity size={16} />, text: "You’ve been inactive for 2 hours — walk 10 mins", category: "Physical Recovery" },
    { icon: <Brain size={16} />, text: "You focus better in evenings — schedule study now", category: "Productivity Peak" },
    { icon: <Moon size={16} />, text: "Sleep was poor — reduce workload today", category: "Energy Management" }
  ]);

  const [missions, setMissions] = useState([]);
  const [stats, setStats] = useState({ xp: 0, level: 1 });

  const fetchGamificationData = async () => {
    try {
      const [missionsRes, statsRes] = await Promise.all([
        api.get("/gamification/missions"),
        api.get("/gamification/stats")
      ]);
      setMissions(missionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Gamification Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchAIAssistantData();
    fetchGamificationData();
    
    // Simulate auto-sync every 30 seconds for "magical" feel
    const syncInterval = setInterval(async () => {
        try {
            await api.post("/sync/fitness");
            fetchGamificationData(); // Refresh steps/progress
        } catch (e) {}
    }, 30000);
    
    return () => clearInterval(syncInterval);
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
        console.log("AI Response Actions:", assistantMessage.actions);
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);

        if (response.data.actions?.length > 0) {
          console.log("Triggering tasksUpdated due to AI actions...");
          window.dispatchEvent(new Event("tasksUpdated"));
          
          // Handle navigation actions (with safety guard for productivity queries)
          const navAction = response.data.actions?.find(a => a.type === "navigation");
          const isProductivityQuery = ["productivity", "report", "review", "performance"].some(k => messageText.toLowerCase().includes(k));
          
          if (navAction && !isProductivityQuery) {
            setTimeout(() => {
              navigate(navAction.path);
            }, 1500); 
          }
        }
      }, 1000);
    } catch (error) {
      setIsTyping(false);
      console.error("AI Assistant Error:", error);
      
      let errorMsg = "I encountered a minor interference in my neural processing. Please retry your command or ensure the gateway is operational.";
      
      if (error.response?.data?.reply) {
        errorMsg = error.response.data.reply;
      } else if (error.response?.status === 401) {
        errorMsg = "Authentication error: Your session is invalid. Redirecting to login to resynchronize...";
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 2500);
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg = "Network error: I cannot reach the backend server. Please check your connection.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg }
      ]);
    }
  };

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col w-full xl:max-w-7xl xl:mx-auto pb-32 page-transition overflow-x-hidden">
      {/* Lighting FX */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[120px] -z-10" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-16">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 sm:p-3.5 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl shrink-0"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-white truncate">
              Smart Control Center
            </h1>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-lime-500/60 truncate">Advanced Intelligence Node</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shrink-0">
           <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 flex-1">
        
        {/* ── Left Column: Chat Area ──────────────────────────────── */}
        <div className="lg:col-span-8 flex flex-col gap-8 md:gap-12">
          <div className="flex-1 overflow-y-auto pr-4 space-y-8 md:space-y-12 custom-scrollbar min-h-[500px] md:min-h-[550px]">
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
                      msg.role === "user" ? "bg-white/5 border-white/10" : "bg-lime-500/10 border-lime-500/20 shadow-lime-500/5"
                    }`}>
                      {msg.role === "user" ? <User size={22} className="text-gray-400" /> : <Bot size={22} className="text-lime-500" />}
                    </div>
                    <div className={`p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] text-sm font-medium leading-relaxed shadow-2xl ${
                      msg.role === "user" 
                        ? "user-bubble text-white border border-lime-500/20 rounded-tr-none" 
                        : "ai-bubble text-white border border-white/5 rounded-tl-none"
                    }`}>
                      {msg.content || "Operational synchronization complete."}

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
                              <p className="text-[10px] font-black text-lime-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Clock size={12} /> Optimized Operational Flow
                              </p>
                              <div className="space-y-2">
                                {action.pending?.length > 0 ? (
                                  action.pending.map((t, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item">
                                      <div className="w-16 text-[10px] font-black text-gray-400 group-hover/item:text-lime-400">{t.timeRange?.split(' - ')[0] || "??:??"}</div>
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

                      {/* Comprehensive System Report UI */}
                      {msg.actions?.find(a => a.type === "comprehensive_report") && (() => {
                        const action = msg.actions.find(a => a.type === "comprehensive_report");
                        return (
                          <div className="mt-6 space-y-6 pt-6 border-t border-white/10">
                            {/* Performance Header */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-lime-500/10 border border-lime-500/20 shadow-lg shadow-lime-500/5">
                               <div>
                                  <p className="text-[10px] font-black text-lime-500/60 uppercase tracking-widest mb-1">Neural Performance Score</p>
                                  <h4 className="text-3xl font-black text-white tracking-tighter">{action.efficiency}%</h4>
                               </div>
                               <div className="w-12 h-12 rounded-xl bg-lime-500/20 flex items-center justify-center text-lime-500">
                                  <TrendingUp size={24} />
                               </div>
                            </div>

                            {/* Smart Suggestion */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                               <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 blur-2xl -z-10" />
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <Brain size={12} className="text-lime-500" /> AI Optimization Insight
                                </p>
                               <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                                  "{action.suggestion}"
                               </p>
                            </div>
                            {/* COMPLETED ALL-TIME */}
                            <div>
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Award size={12} /> Historical Milestones
                              </p>
                              <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {action.completed?.length > 0 ? (
                                  action.completed.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                       <span className="text-xs font-bold text-emerald-100/90">{t.title}</span>
                                       <span className="text-[8px] font-black text-emerald-500/60 uppercase">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">No historical milestones recorded.</div>
                                )}
                              </div>
                            </div>

                            {/* MISSED ALL-TIME */}
                            <div>
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertCircle size={12} /> System Overdue Nodes
                              </p>
                              <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {action.missed?.length > 0 ? (
                                  action.missed.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                                      <span className="text-xs font-bold text-rose-100/90">{t.title}</span>
                                      <span className="text-[8px] font-black text-rose-500/60 uppercase">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">System integrity maintained. No missed objectives.</div>
                                )}
                              </div>
                            </div>

                            {/* RESCHEDULED ALL-TIME */}
                            <div>
                              <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap size={12} /> Re-optimized Nodes (Rescheduled)
                              </p>
                              <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {action.rescheduled?.length > 0 ? (
                                  action.rescheduled.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                      <div className="flex-1">
                                        <p className="text-xs font-bold text-yellow-100/90">{t.title}</p>
                                        <p className="text-[8px] font-black text-yellow-500/60 uppercase">Resynchronized {t.count}x</p>
                                      </div>
                                      <span className="text-[8px] font-black text-yellow-500/60 uppercase">{new Date(t.date).toLocaleDateString()}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-[10px] text-gray-600 italic">No rescheduled tasks in history.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* AI Recommendations UI */}
                      {msg.actions?.find(a => a.type === "recommendations") && (() => {
                        const action = msg.actions.find(a => a.type === "recommendations");
                        return (
                          <div className="mt-6 space-y-4 pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black text-lime-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Sparkles size={12} /> {action.category} Recommendations
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                              {action.links.map((link, idx) => (
                                <RecommendationCard key={idx} link={link} />
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Render Executed Action Feedback */}
                      {msg.actions && msg.actions.length > 0 && msg.actions.some(a => ['task_created', 'task_updated', 'task_deleted'].includes(a.type)) && (
                        <div className="mt-4 space-y-2 pt-4 border-t border-white/10">
                          {msg.actions.map((action, idx) => {
                             if (action.type === 'task_created') return (
                               <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-[10px] font-bold text-lime-400">
                                 <CheckCircle size={14} /> Task Created: {action.title}
                               </div>
                             );
                             if (action.type === 'task_updated') return (
                               <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-400">
                                 <TrendingUp size={14} /> Task Updated: {action.title}
                               </div>
                             );
                             if (action.type === 'task_deleted') return (
                               <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
                                 <AlertCircle size={14} /> Task Deleted: {action.title}
                               </div>
                             );
                             return null;
                          })}
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
                    <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0">
                      <Bot size={22} className="text-lime-500" />
                    </div>
                    <div className="px-6 py-4 ai-bubble rounded-[2rem] sm:rounded-[3rem] rounded-tl-none flex gap-2">
                      <span className="w-2 h-2 bg-lime-500/40 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-lime-500/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-lime-500/80 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="glass-card p-4 flex items-center gap-4 border border-white/10 shadow-2xl mt-auto">
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
              className="w-14 h-14 rounded-2xl bg-lime-500 flex items-center justify-center text-white shadow-xl shadow-lime-500/30 hover:scale-105 active:scale-95 transition-all ripple"
            >
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* ── Right Column: Insights & Actions ────────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-8 md:gap-12 pb-10 lg:pb-0">
          
          {/* Quick Actions Grid */}
          {/* Quick Actions Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
               <Zap size={14} className="text-lime-500" />
               Quick Commands
            </h3>
             <div className="grid grid-cols-2 gap-4 md:gap-6">
              <QuickActionCard icon={ClipboardList} label="Plan Day" onClick={() => handleSend("Analyze my load and plan my day for maximum focus")} />
              <QuickActionCard icon={Calendar} label="Optimize" onClick={() => handleSend("Reschedule my missed tasks to better times")} />
              <QuickActionCard icon={Zap} label="Boost" onClick={() => handleSend("Give me a productivity boost tip")} />
              <QuickActionCard icon={Brain} label="Review" onClick={() => handleSend("Review my weekly operational performance")} />
            </div>
          </div>

          {/* AI Suggestions Panel */}
          <AISuggestionsPanel suggestions={suggestions} />

          {/* Daily Missions */}
          <DailyMissions missions={missions} />

          {/* Achievement Vault Panel */}
          <AchievementVault ratio={insightData.ratio} tasks={allTasks} stats={stats} />

          {/* Mini Progress Card */}
          <div className="glass-card p-6 sm:p-8 flex items-center gap-6">
             <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none" strokeWidth="6" />
                  <motion.circle 
                    cx="32" cy="32" r="28" 
                    className="stroke-lime-500 fill-none" 
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