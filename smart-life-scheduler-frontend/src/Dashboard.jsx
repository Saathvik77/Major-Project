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
  Loader2
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

const VideoItem = ({ title, views, date, thumbnail, trend }) => (
  <div className="flex items-center gap-4 group p-3 hover:bg-white/[0.04] rounded-3xl transition-all cursor-pointer border border-transparent hover:border-white/5">
    <div className="w-16 h-10 rounded-xl overflow-hidden bg-white/[0.03] flex-shrink-0 relative">
       <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
    <div className="flex-1 min-w-0 px-1">
      <div className="text-[13px] font-bold text-slate-200 truncate">{title}</div>
      <div className="text-[10px] text-slate-500 font-medium">{date}</div>
    </div>
    <div className="flex flex-col items-end gap-0.5">
       <div className="text-xs font-bold text-slate-300">{views}</div>
       <div className={`text-[10px] font-black tracking-tight ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
         {trend > 0 ? '+' : ''}{trend}%
       </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showStats, setShowStats] = useState(false);
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
    <div className="min-h-screen bg-transparent pl-[84px] text-white overflow-hidden page-transition">
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-4 h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Bot size={20} strokeWidth={3} />
             </div>
             <h1 className="text-lg font-black tracking-tight text-white/90">Performance Intelligence</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/[0.03] border border-white/10 p-2 rounded-xl text-slate-500 hover:text-white transition-all cursor-pointer backdrop-blur-md">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <div className="bg-white/[0.03] border border-white/10 p-2 rounded-xl text-slate-500 hover:text-white transition-all cursor-pointer relative backdrop-blur-md">
              <Bell size={18} strokeWidth={2.5} />
              <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all cursor-pointer">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>
        </header>

        {/* ── Main Hero Card ────────────────────────────────────────── */}
        <div className="relative">
          <div className="glass-card bg-white/[0.01] border-white/10 p-12 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
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
                      Neural Analytics Engine Active
                   </div>
                </div>
                
                <h2 className="text-6xl lg:text-7xl font-black leading-[1.1] mb-12 text-white tracking-tighter">
                  Analyze <br /> Your Growth
                </h2>
                
                <div className="flex gap-4 mb-20">
                   <button 
                     onClick={handleStartAnalysis}
                     disabled={isAnalyzing}
                     className="bg-orange-500 text-white min-w-[180px] py-4 rounded-full font-black text-[11px] hover:scale-105 transition-all active:scale-95 shadow-xl shadow-orange-500/25 uppercase tracking-widest flex items-center justify-center gap-2"
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
                     className="bg-white/[0.05] border border-white/10 text-slate-300 px-8 py-4 rounded-full font-black text-[11px] hover:bg-white/[0.1] hover:text-white transition-all active:scale-95 uppercase tracking-widest flex items-center gap-2"
                   >
                     <Zap size={16} />
                     View Reports
                   </button>
                </div>

                <div className="flex gap-12 pt-8">
                   <StatBadge dotColor="bg-blue-400" label="Tasks Analysis" value={stats.efficiency} isVisible={showStats} />
                   <StatBadge dotColor="bg-orange-500" label="Completed" value={stats.totalTasks} isVisible={showStats} />
                   <StatBadge dotColor="bg-emerald-400" label="Performance" value={stats.growth} isVisible={showStats} />
                   <StatBadge dotColor="bg-rose-500" label="Missed Tasks" value={stats.missed} isVisible={showStats} />
                </div>
             </div>
          </div>
        </div>

        {/* ── Bottom Section: Performance Stream ────────────────────────── */}
        <div className="mt-2 flex-1 min-h-0 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <Activity size={18} className="text-orange-500" />
                 <h3 className="font-black text-lg text-white/90 tracking-tight">System Performance</h3>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-[10px] font-black text-slate-500 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 cursor-pointer hover:bg-white/[0.06] transition-all uppercase tracking-widest">
                    Real-time Data <MoreHorizontal size={14} />
                 </div>
              </div>
           </div>

           <div className="glass-card flex-1 p-4 overflow-hidden bg-white/[0.01] border-white/5 backdrop-blur-3xl">
             <div className="grid md:grid-cols-2 gap-x-12 gap-y-1.5 h-full overflow-y-auto pr-2 custom-scrollbar">
                <VideoItem 
                   title="Morning Optimization Session" 
                   views="+ 4.2k pts" 
                   trend={12} 
                   date="Today, 09:00 AM"
                   thumbnail="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="AI Strategy Review" 
                   views="+ 2.8k pts" 
                   trend={8} 
                   date="Today, 11:30 AM"
                   thumbnail="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="Focus Window Efficiency" 
                   views="- 1.2k pts" 
                   trend={-3} 
                   date="Yesterday"
                   thumbnail="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="High Priority Pipeline" 
                   views="+ 5.6k pts" 
                   trend={24} 
                   date="Today, 02:00 PM"
                   thumbnail="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200"
                />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;