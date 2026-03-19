import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckCircle, 
  BarChart3, 
  BrainCircuit, 
  Plus,
  Zap,
  Sparkles,
  Activity,
  TrendingUp,
  AlertCircle,
  Calendar as CalendarIcon,
  Bot,
  Loader2,
  ChevronRight,
  User,
  LogOut,
  Bell,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';

const StatBadge = ({ dotColor, label, value, isVisible }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-white leading-none">
        {isVisible ? value : "—"}
      </p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="glass-card p-6 flex flex-col gap-4 group card-hover-lift">
    <div className="flex items-center justify-between relative z-10">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/5">
        <Icon size={20} />
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-2xl font-black text-white tracking-tighter mt-1">{value}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 pt-4 border-t border-white/5 relative z-10">
      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
        <TrendingUp size={12} />
        {trend}
      </div>
      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">vs last cycle</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: "0",
    efficiency: "0%",
    growth: "0%",
    missed: "0"
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTasks, setActiveTasks] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/intelligence/summary'),
          api.get('/tasks?limit=3')
        ]);
        
        setStats({
          totalTasks: String(statsRes.data.completed || 0),
          efficiency: statsRes.data.completedRatio || "0%",
          growth: statsRes.data.productivityScore || "0%",
          missed: String(statsRes.data.overdue || 0)
        });

        setActiveTasks(tasksRes.data.tasks?.filter(t => !t.completed).slice(0, 3) || []);

        setTimeout(() => {
          setIsLoading(false);
          setShowStats(true);
        }, 800);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/analytics');
    }, 1500);
  };

  const handleAIPlanDay = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post("/ai/chat", { message: "plan my day" });
      if (response.data.actions?.length > 0) {
        // Redirect to tasks to see the newly planned day
        navigate('/tasks');
      }
    } catch (error) {
      console.error("AI Plan Day Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 font-sans text-white relative flex flex-col gap-10 max-w-7xl mx-auto page-transition">
      
      {/* ── Header Area ────────────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 shadow-xl backdrop-blur-xl">
            <LayoutDashboard size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Smart Life Scheduler</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">Operational Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Menu */}
          <div className="relative">
            <div className="bg-white/[0.03] border border-white/10 p-2.5 rounded-xl text-gray-500 hover:text-white transition-all cursor-pointer backdrop-blur-md">
              <Bell size={18} strokeWidth={2} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#0a0c10]" />
            </div>
          </div>
          
          <div className="relative">
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-500/20 transition-all shadow-lg shadow-orange-500/5"
            >
              <User size={20} strokeWidth={2} />
            </div>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-56 glass-morphism rounded-2xl p-2 z-[110] border border-white/10 shadow-2xl"
                >
                  <div className="px-3 py-3 border-b border-white/5 mb-2">
                    <p className="text-xs font-black text-white uppercase tracking-widest">Smart User</p>
                    <p className="text-[9px] text-gray-500 font-bold truncate">Synchronized Session</p>
                  </div>
                  <div className="space-y-1">
                    <div onClick={() => navigate('/profile')} className="px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-sm text-gray-400 hover:text-white">
                      <User size={16} /> Profile Configuration
                    </div>
                    <div onClick={handleLogout} className="px-3 py-2.5 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-sm text-rose-400 hover:text-rose-300">
                      <LogOut size={16} /> Terminate Session
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── Main Hero Card ────────────────────────────────────────── */}
      <div className="relative">
        <div className="hero-card p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 min-h-[460px]">
           
           {/* Data Visualization Column */}
           <div className="flex-1 w-full relative z-20">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/60">System Intelligence Active</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black leading-[1.1] mb-8 text-white tracking-tighter">
                Strategic <br /> Performance
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
                 <motion.button 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={handleAIPlanDay}
                   disabled={isAnalyzing}
                   className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                 >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Sparkles size={16} className="relative z-10" />
                    <span className="relative z-10">{isAnalyzing ? "Optimizing..." : "AI Plan My Day"}</span>
                 </motion.button>

                 <motion.button 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => navigate('/tasks')}
                   className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                 >
                    <Plus size={16} className="text-orange-500" />
                    Quick Task
                 </motion.button>
              </div>

              <div className="grid grid-cols-2 md:flex md:gap-12 pt-8 border-t border-white/5">
                 <StatBadge dotColor="bg-orange-500" label="Focus Score" value={stats.efficiency} isVisible={showStats} />
                 <StatBadge dotColor="bg-orange-400" label="Completed" value={stats.totalTasks} isVisible={showStats} />
                 <StatBadge dotColor="bg-orange-300" label="Active Momentum" value={stats.growth} isVisible={showStats} />
                 <StatBadge dotColor="bg-rose-500" label="Missed" value={stats.missed} isVisible={showStats} />
              </div>
           </div>

           {/* Right Column: Productivity Ring (Glassmorphism design) */}
           <div className="hidden lg:flex flex-1 items-center justify-center relative">
              <div className="relative w-72 h-72">
                 {/* Background Glow */}
                 <div className="absolute inset-0 bg-orange-500/10 blur-[60px] rounded-full animate-pulse" />
                 
                 {/* Outer Ring */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="144" cy="144" r="130" 
                      className="stroke-white/5 fill-none" 
                      strokeWidth="12" 
                    />
                    <motion.circle 
                      cx="144" cy="144" r="130" 
                      className="stroke-orange-500 fill-none" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 816" }}
                      animate={{ strokeDasharray: `${showStats ? (parseInt(stats.efficiency) * 8.16) : 0} 816` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                 </svg>

                 {/* Inner Glass Card */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full glass-morphism flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
                       <span className="text-5xl font-black text-white tracking-tighter">
                          {showStats ? stats.efficiency : "0%"}
                       </span>
                       <Activity size={20} className="text-orange-500 mt-2" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── Stats Overview Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 h-32 skeleton border-none" />
          ))
        ) : (
          <>
            <StatCard 
              icon={CheckCircle} 
              label="Tasks Completed" 
              value={stats.totalTasks} 
              trend="+12%" 
            />
            <StatCard 
              icon={Zap} 
              label="Smart Efficiency" 
              value={stats.efficiency} 
              trend="+5.4%" 
            />
            <StatCard 
              icon={Activity} 
              label="Focus Momentum" 
              value={stats.growth} 
              trend="+8.2%" 
            />
            <StatCard 
              icon={AlertCircle} 
              label="Missed Syncs" 
              value={stats.missed} 
              trend="-2%" 
            />
          </>
        )}
      </div>

      {/* ── Bottom Content Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Access Card */}
        <div className="lg:col-span-8 glass-card p-8 flex flex-col gap-8 relative overflow-hidden group min-h-[400px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Active Operational Flow</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Pending prioritized tasks</p>
            </div>
            <button 
              onClick={() => navigate('/tasks')}
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3 justify-center">
             {activeTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fadeIn">
                 <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500/40 mb-6 border border-orange-500/20 shadow-inner">
                   <Plus size={40} strokeWidth={1} />
                 </div>
                 <h4 className="text-white font-black text-lg mb-2">No active tasks detected</h4>
                 <p className="text-xs text-gray-500 max-w-[260px] leading-relaxed mb-8">
                   Your operational flow is currently empty. Start by adding a task or let AI plan your day.
                 </p>
                 <button 
                   onClick={() => navigate('/tasks')}
                   className="px-8 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                 >
                   Add your first task
                 </button>
               </div>
             ) : (
               activeTasks.map((task, i) => (
                 <div key={task._id || i} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group/item hover:bg-white/[0.06] transition-all hover:border-white/10">
                   <div className="flex items-center gap-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,140,60,0.5)]" />
                      <div>
                         <p className="text-sm font-black text-white group-hover/item:text-orange-400 transition-colors tracking-tight">{task.title}</p>
                         <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">{task.category || "General"}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-white">{task.startTime || "09:00"}</p>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Scheduled</p>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="lg:col-span-4 glass-card p-8 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] -z-10 group-hover:bg-orange-500/20 transition-all" />
           <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/5">
                 <Bot size={24} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Smart Coach</span>
              </div>
           </div>
           
           <h4 className="text-lg font-black text-white tracking-tight mb-3">Optimize Peak Performance</h4>
           <p className="text-sm text-gray-400 leading-relaxed mb-10">
              Based on your operational data, you are operating at <span className="text-orange-400 font-bold">88% efficiency</span>. Consider rescheduling high-load tasks to your peak focus window at 16:00.
           </p>
           
           <button 
             onClick={() => navigate('/ai-assistant')}
             className="w-full py-4 rounded-[1.25rem] bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 ripple"
           >
              Command Sync
              <ChevronRight size={14} />
           </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;