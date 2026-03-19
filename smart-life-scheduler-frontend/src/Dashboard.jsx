import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  PlayCircle, 
  MoreHorizontal,
  Search,
  Bell,
  ArrowUpRight,
  Eye,
  MessageSquare,
  Bot,
  Zap,
  Activity,
  BrainCircuit,
  Loader2,
  Timer,
  CheckCircle2,
  Sparkles,
  LogOut,
  Settings,
  CloudRain,
  User
} from 'lucide-react';

const StatBadge = ({ dotColor, label, value, isVisible }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: isVisible ? 1 : 0.3, y: 0 }}
    className="flex flex-col gap-1 min-w-[120px]"
  >
    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </div>
    <div className="text-2xl font-black text-white tracking-tighter">
      {isVisible ? value : "---"}
    </div>
  </motion.div>
);

const PremiumCard = ({ title, icon: Icon, value, subtitle, colorClass, gradientClass, onClick, actionNode }) => (
  <div 
    onClick={onClick}
    className={`min-w-[280px] h-[160px] glass-card p-6 flex flex-col justify-between group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-white/10 relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-radial-gradient ${gradientClass} opacity-20 group-hover:opacity-40 transition-opacity blur-2xl pointer-events-none`} />
    <div className="flex items-start justify-between relative z-10">
       <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
       </div>
       {onClick && <ArrowUpRight size={20} className="text-gray-500 group-hover:text-white transition-colors" />}
    </div>
    <div className="relative z-10 mt-auto">
       <h3 className="text-white font-black text-xl tracking-tight">{title}</h3>
       <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{subtitle}</p>
          {actionNode ? actionNode : <span className="text-sm font-black text-white">{value}</span>}
       </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [stats, setStats] = useState({
    efficiency: "84%",
    totalTasks: "0",
    growth: "+12%",
    missed: "0"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/tasks?limit=100");
        const allTasks = res.data.tasks || [];
        setTasks(allTasks);

        // Preliminary count
        const completed = allTasks.filter(t => t.completed).length;
        const total = allTasks.length;
        const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Count missed (simplified logic: expired tasks not completed)
        const now = new Date();
        const missed = allTasks.filter(t => !t.completed && new Date(t.date) < now).length;

        setStats(prev => ({
          ...prev,
          efficiency: `${efficiency}%`,
          totalTasks: total > 999 ? `${(total/1000).toFixed(1)}k` : total.toString(),
          missed: missed.toString()
        }));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setShowStats(false);
    
    // AI Thinking Simulation
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowStats(true);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-transparent pl-0 md:pl-[84px] text-white overflow-x-hidden page-transition pb-24 md:pb-20">
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-10 flex flex-col gap-4 min-h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Bot size={20} strokeWidth={3} />
             </div>
             <h1 className="text-lg font-black tracking-tight text-white/90">Smart Life Scheduler</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/[0.03] border border-white/10 p-2 rounded-xl text-slate-500 hover:text-white transition-all cursor-pointer backdrop-blur-md">
              <Search size={18} strokeWidth={2.5} />
            </div>
            
            {/* Notification Menu */}
            <div className="relative">
              <div 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                className="bg-white/[0.03] border border-white/10 p-2 rounded-xl text-slate-500 hover:text-white transition-all cursor-pointer backdrop-blur-md"
              >
                <Bell size={18} strokeWidth={2.5} />
                <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
              </div>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 glass-card border border-white/10 rounded-2xl overflow-hidden z-50 p-2 shadow-2xl"
                  >
                     <div className="p-3 border-b border-white/5 mb-2">
                       <h4 className="text-white font-bold text-sm">Notifications</h4>
                     </div>
                     <div className="flex flex-col gap-1">
                        <div className="p-3 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer flex items-start gap-3">
                           <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                             <CloudRain size={16} />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white/90">Weather Update</p>
                             <p className="text-xs text-slate-400 mt-0.5">72°F and partly cloudy today. Perfect for deep work.</p>
                           </div>
                        </div>
                        <div className="p-3 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer flex items-start gap-3">
                           <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                             <CheckCircle2 size={16} />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-white/90">Task Milestone</p>
                             <p className="text-xs text-slate-400 mt-0.5">You've reached {stats.totalTasks} completed tasks!</p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <div 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all cursor-pointer"
              >
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover opacity-80" />
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 glass-card border border-white/10 rounded-2xl overflow-hidden z-50 p-2 shadow-2xl"
                  >
                     <div className="p-3 border-b border-white/5 mb-1">
                       <p className="text-white font-bold text-sm">Felix User</p>
                       <p className="text-xs text-slate-400">felix@premium.com</p>
                     </div>
                     <div className="flex flex-col gap-1">
                        <div 
                          onClick={() => navigate('/settings')}
                          className="px-3 py-2.5 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-sm text-slate-200 hover:text-white"
                        >
                           <Settings size={16} />
                           Account Settings
                        </div>
                        <div 
                          className="px-3 py-2.5 hover:bg-white/[0.04] rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-sm text-slate-200 hover:text-white"
                        >
                           <User size={16} />
                           View Profile
                        </div>
                        <div className="h-px bg-white/5 my-1" />
                        <div 
                          onClick={() => navigate('/login')}
                          className="px-3 py-2.5 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer flex items-center gap-3 text-sm text-rose-400 hover:text-rose-300"
                        >
                           <LogOut size={16} />
                           Log Out
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
          <div className="hero-card border border-white/10 p-12 flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
             {/* Character Image - Centered and Overlapping */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="absolute right-[-2%] bottom-[-5%] w-[650px] pointer-events-none z-10 hidden lg:block"
             >
                <img 
                  src="https://cdn3d.iconscout.com/3d/premium/thumb/man-working-on-laptop-3025709-2526911.png" 
                  alt="3D Character" 
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] opacity-80"
                />
             </motion.div>

             <div className="relative z-20">
                <div className="flex items-center gap-2 mb-8">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                       
                   </div>
                </div>
                
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-8 md:mb-12 text-white tracking-tighter">
                  Analyze <br /> Your Growth
                </h2>
                
                <div className="flex flex-col md:flex-row gap-4 mb-12 md:mb-20">
                   <button 
                     onClick={handleStartAnalysis}
                     disabled={isAnalyzing}
                     className="bg-orange-500 w-full md:w-auto text-white min-w-[180px] py-4 rounded-full font-black text-[11px] hover:scale-105 transition-all active:scale-95 shadow-xl shadow-orange-500/25 uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     {isAnalyzing ? (
                       <>
                         <Loader2 size={16} className="animate-spin" />
                         Analyzing...
                       </>
                     ) : (
                       <>
                         <BrainCircuit size={16} />
                         Start Analysis
                       </>
                     )}
                   </button>
                   <button 
                     onClick={() => navigate('/analytics')}
                     className="bg-white/[0.05] border border-white/10 w-full md:w-auto justify-center text-slate-300 px-8 py-4 rounded-full font-black text-[11px] hover:bg-white/[0.1] hover:text-white transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
                   >
                     <Zap size={16} />
                     View Reports
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4 md:flex md:gap-12 pt-8">
                   <StatBadge dotColor="bg-blue-400" label="Tasks Analysis" value={stats.efficiency} isVisible={showStats} />
                   <StatBadge dotColor="bg-orange-500" label="Completed" value={stats.totalTasks} isVisible={showStats} />
                   <StatBadge dotColor="bg-emerald-400" label="Performance" value={stats.growth} isVisible={showStats} />
                   <StatBadge dotColor="bg-rose-500" label="Missed Tasks" value={stats.missed} isVisible={showStats} />
                </div>
             </div>
          </div>
        </div>

        {/* ── Bottom Section: Premium Widget Row ────────────────────────── */}
        <div className="mt-2 flex-1 min-h-0 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <Sparkles size={18} className="text-amber-500" />
                 <h3 className="font-black text-lg text-white/90 tracking-tight">Quick Access</h3>
              </div>
           </div>

           <div className="flex-1 overflow-hidden relative">
             <div className="flex items-center gap-6 overflow-x-auto pb-4 h-full custom-scrollbar scroll-smooth snap-x">
               <div className="snap-start shrink-0">
                 <PremiumCard 
                   title="Focus Timer"
                   subtitle="Deep Work Protocol"
                   icon={Timer}
                   colorClass="bg-rose-500/20 border-rose-500/30 text-rose-500 shadow-rose-500/10"
                   gradientClass="from-rose-500"
                   actionNode={
                     <button className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider transition-colors shadow-lg shadow-rose-500/20">
                       Start 25:00
                     </button>
                   }
                 />
               </div>
               
               <div className="snap-start shrink-0">
                 <PremiumCard 
                   title="Task Intel"
                   subtitle="Today's Priorities"
                   value={`${stats.totalTasks} Total`}
                   icon={CheckCircle2}
                   colorClass="bg-emerald-500/20 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10"
                   gradientClass="from-emerald-500"
                   onClick={() => navigate('/tasks')}
                 />
               </div>

               <div className="snap-start shrink-0">
                 <PremiumCard 
                   title="AI Assistant"
                   subtitle="Neural Interfacing"
                   value="Active"
                   icon={Bot}
                   colorClass="bg-indigo-500/20 border-indigo-500/30 text-indigo-500 shadow-indigo-500/10"
                   gradientClass="from-indigo-500"
                   onClick={() => navigate('/ai-assistant')}
                 />
               </div>
               
               <div className="snap-start shrink-0">
                 <PremiumCard 
                   title="Analytics Hub"
                   subtitle="Performance Growth"
                   value={stats.efficiency}
                   icon={Activity}
                   colorClass="bg-amber-500/20 border-amber-500/30 text-amber-500 shadow-amber-500/10"
                   gradientClass="from-amber-500"
                   onClick={() => navigate('/analytics')}
                 />
               </div>
               
               {/* Spacer for overflow padding */}
               <div className="w-4 shrink-0" />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;