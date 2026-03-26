import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList,
  PieChart,
  Settings,
  BarChart3, 
  BrainCircuit, 
  Plus,
  Sparkles,
  Activity,
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
import maleAvatar from "./assets/avatars/male_avatar.svg";
import femaleAvatar from "./assets/avatars/female_avatar.svg";

const StatBadge = ({ dotColor, label, value, isVisible }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2 h-2 rounded-full ${dotColor}`} />
    <div>
      <p className="text-xs font-black text-gray-500 uppercase tracking-wide leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-white leading-none">
        {isVisible ? value : "—"}
      </p>
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

const QuickLaunchHero = ({ onNavigate }) => {
  const [imageError, setImageError] = useState(false);
  
  const launchOptions = [
    { label: "Tasks", icon: <ClipboardList />, path: "/tasks", color: "text-lime-500" },
    { label: "Analytics", icon: <PieChart />, path: "/analytics", color: "text-lime-500" },
    { label: "Settings", icon: <Settings />, path: "/settings", color: "text-lime-500" },
    { label: "AI Assistant", icon: <Bot />, path: "/ai-assistant", color: "text-lime-500" },
  ];

  return (
    <div className="relative w-full mb-10 md:mb-16 px-4 md:px-0">
      <div className="relative aspect-auto md:aspect-[2.2/1] w-full rounded-3xl md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] group bg-[#0a0c10] min-h-[300px] md:min-h-[450px]">
        
        {/* Deep Glow Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/10 via-transparent to-blue-500/5 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.08)_0%,transparent_70%)] animate-pulse" />

        {/* The Exact Image Background */}
        {!imageError && (
          <img 
            src="/assets/dashboard_hero.jpeg" 
            alt="Dashboard Hero" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-lighten opacity-60 group-hover:opacity-80 transition-all duration-1000 scale-105 group-hover:scale-100"
            onError={() => setImageError(true)}
          />
        )}

        {/* The background image is displayed via the <img> tag above. No interactive overlays here. */}

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      </div>
    </div>
  );
};

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

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, tasksRes, userRes] = await Promise.all([
          api.get('/intelligence/summary'),
          api.get('/tasks?limit=3'),
          api.get('/auth/profile')
        ]);
        
        setUser(userRes.data.user || userRes.data);
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
    <div className="min-h-screen pl-0 md:pl-20 p-4 sm:p-6 md:p-8 lg:p-12 relative z-10 font-sans text-white max-w-7xl mx-auto page-transition pb-28 md:pb-10">
      
      {/* ── Header Area ────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 mb-8 md:mb-12">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lime-500 shadow-xl backdrop-blur-xl shrink-0">
            <LayoutDashboard size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-white truncate max-w-[140px] xs:max-w-none">Smart Life Scheduler</h1>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1 truncate">Operational Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AI Floating Button Trigger (Instead of notification) */}
          <div 
            onClick={() => navigate('/ai-assistant')}
            className="bg-lime-500 text-white p-2.5 rounded-xl hover:bg-lime-600 transition-all cursor-pointer shadow-lg shadow-lime-500/20 group"
          >
            <Bot size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </div>
          
          <div className="relative">
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 cursor-pointer hover:bg-lime-500/20 transition-all shadow-lg shadow-lime-500/5 overflow-hidden"
            >
              <img 
                src={user?.gender?.toLowerCase() === 'female' ? femaleAvatar : maleAvatar} 
                alt="3D Avatar" 
                className="w-full h-full object-cover scale-110"
              />
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
                    <p className="text-sm font-black text-white uppercase tracking-wide">{user?.name || "Smart User"}</p>
                    <p className="text-xs text-gray-500 font-bold truncate">Synchronized Session</p>
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

      {/* ── Quick Launch Hero (Monitor) ────────────────────────── */}
      <QuickLaunchHero onNavigate={navigate} />

      {/* ── Main Hero Card ────────────────────────────────────────── */}
      <div className="relative mb-8 md:mb-12 lg:mb-20">
         <div className="hero-card p-6 sm:p-8 md:p-16 flex flex-col lg:flex-row items-center gap-8 md:gap-16 min-h-[300px] md:min-h-[450px]">
            
            {/* Data Visualization Column */}
            <div className="flex-1 w-full relative z-20 text-center lg:text-left">
               <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wide text-lime-500/60">System Intelligence Active</span>
               </div>
               
               <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-8 text-white tracking-tighter">
                 Strategic <br className="hidden lg:block" /> Performance
               </h2>
               
               <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAIPlanDay}
                    disabled={isAnalyzing}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-lime-500 to-lime-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-lime-500/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                     <Sparkles size={16} className="relative z-10" />
                     <span className="relative z-10">{isAnalyzing ? "Optimizing..." : "AI Plan My Day"}</span>
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/tasks')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                  >
                     <Plus size={16} className="text-lime-500" />
                     Quick Task
                  </motion.button>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5 place-items-center lg:place-items-start">
                  <StatBadge dotColor="bg-lime-500" label="Focus Score" value={stats.efficiency} isVisible={showStats} />
                  <StatBadge dotColor="bg-lime-400" label="Completed" value={stats.totalTasks} isVisible={showStats} />
                  <StatBadge dotColor="bg-lime-300" label="Active Momentum" value={stats.growth} isVisible={showStats} />
                  <StatBadge dotColor="bg-rose-500" label="Missed" value={stats.missed} isVisible={showStats} />
               </div>
            </div>

           {/* Right Column: Productivity Ring (Glassmorphism design) */}
           <div className="hidden lg:flex flex-1 items-center justify-center relative">
              <div className="relative w-80 h-80">
                 {/* Background Glow */}
                 <div className="absolute inset-0 bg-lime-500/10 blur-[60px] rounded-full animate-pulse" />
                 
                 {/* Outer Ring */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="160" cy="160" r="145" 
                      className="stroke-white/5 fill-none" 
                      strokeWidth="14" 
                    />
                    <motion.circle 
                      cx="160" cy="160" r="145" 
                      className="stroke-lime-500 fill-none" 
                      strokeWidth="14" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 911" }}
                      animate={{ strokeDasharray: `${showStats ? (parseInt(stats.efficiency) * 9.11) : 0} 911` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                 </svg>

                 {/* Inner Glass Card */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-56 rounded-full glass-morphism flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                       <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Efficiency</span>
                       <span className="text-6xl font-black text-white tracking-tighter">
                          {showStats ? stats.efficiency : "0%"}
                       </span>
                       <Activity size={24} className="text-lime-500 mt-2" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>


      {/* ── Bottom Content Row ───────────────────────────────────── */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 lg:gap-20">
        
        {/* Quick Access Card */}
        <div className="lg:col-span-8 glass-card p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col gap-6 md:gap-10 relative overflow-hidden group min-h-[300px] md:min-h-[450px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Active Operational Flow</h3>
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1">Pending prioritized tasks</p>
            </div>
            <button 
              onClick={() => navigate('/tasks')}
              className="p-2 text-gray-600 hover:text-lime-500 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-3 justify-center">
             {activeTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center py-12 px-4 animate-fadeIn">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-lime-500/10 flex items-center justify-center text-lime-500/40 mb-6 border border-lime-500/20 shadow-inner">
                   <Plus size={window.innerWidth < 768 ? 32 : 40} strokeWidth={1} />
                 </div>
                 <h4 className="text-white font-black text-base md:text-lg mb-2">No active tasks detected</h4>
                 <p className="text-[11px] md:text-xs text-gray-500 max-w-[260px] leading-relaxed mb-8">
                   Your operational flow is currently empty. Start by adding a task or let AI plan your day.
                 </p>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="px-8 py-3 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-500 font-black text-xs uppercase tracking-wide hover:bg-lime-500 hover:text-white transition-all active:scale-95"
                  >
                    Add your first task
                  </button>
               </div>
             ) : (
                activeTasks.map((task, i) => (
                  <div key={task._id || i} className="p-4 md:p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group/item hover:bg-white/[0.06] transition-all hover:border-white/10">
                    <div className="flex items-center gap-4 md:gap-5">
                       <div className="w-1.5 h-1.5 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
                        <div>
                           <p className="text-sm font-black text-white group-hover/item:text-lime-400 transition-colors tracking-tight">{task.title}</p>
                           <p className="text-xs font-black text-gray-600 uppercase tracking-wide mt-1">{task.category || "General"}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-black text-white">{formatTime12Hour(task.startTime)}</p>
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wide mt-1 shrink-0">Scheduled</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="lg:col-span-4 glass-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-lime-500/5 to-transparent border-lime-500/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 blur-[40px] -z-10 group-hover:bg-lime-500/20 transition-all" />
           <div className="flex items-start justify-between mb-6 md:mb-8">
              <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 shadow-lg shadow-lime-500/5">
                 <Bot size={24} />
              </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wide">Smart Coach</span>
               </div>
           </div>
           
           <h4 className="text-base md:text-lg font-black text-white tracking-tight mb-3">Optimize Peak Performance</h4>
           <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-8 md:mb-10">
              Based on your operational data, you are operating at <span className="text-lime-400 font-bold">88% efficiency</span>. Consider rescheduling high-load tasks to your peak focus window at 4:00 PM.
           </p>
                      <button 
              onClick={() => navigate('/ai-assistant')}
              className="w-full py-4 rounded-[1.25rem] bg-lime-500 text-white font-black text-sm uppercase tracking-wide hover:bg-lime-600 transition-all shadow-xl shadow-lime-500/20 flex items-center justify-center gap-2 ripple"
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