import React from 'react';
import { motion } from 'framer-motion';
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
  Bot
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const mockChartData = [
  { name: 'Oct', value: 30 },
  { name: 'Nov', value: 45 },
  { name: 'Dec', value: 35 },
  { name: 'Jan', value: 60 },
  { name: 'Feb', value: 50 },
  { name: 'Mar', value: 85 },
  { name: 'Apr', value: 70 },
];

const StatBadge = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
      <div className={`w-1.5 h-1.5 rounded-sm ${colorClass}`} />
      {label}
    </div>
    <div className="text-xl font-bold text-slate-800">{value}</div>
  </div>
);

const VideoItem = ({ title, views, date, thumbnail, trend }) => (
  <div className="flex items-center gap-4 group p-2 hover:bg-white/40 rounded-2xl transition-all cursor-pointer">
    <div className="w-16 h-10 rounded-lg overflow-hidden bg-white/20 flex-shrink-0 relative">
       <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-slate-800 truncate">{title}</div>
      <div className="text-[10px] text-slate-500">{date}</div>
    </div>
    <div className="flex flex-col items-end gap-1">
       <div className="text-xs font-bold text-slate-700">{views}</div>
       <div className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
         {trend > 0 ? '+' : ''}{trend}%
       </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-transparent pl-[84px] text-slate-800 overflow-hidden page-transition">
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-8 h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Bot size={22} />
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-800">Channel Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/50 border border-black/5 p-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer backdrop-blur-md">
              <Search size={20} />
            </div>
            <div className="bg-white/50 border border-black/5 p-2 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer relative backdrop-blur-md">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#f1f3f6]" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/50 border border-black/5 overflow-hidden backdrop-blur-md">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        {/* ── Top Section: Expanded Hero Banner & Character ─────────────── */}
        <div className="relative flex gap-6 min-h-[480px]">
          
          {/* Main Hero Banner - Takes full width now */}
          <div className="flex-1 glass-card p-12 flex flex-col justify-between relative overflow-hidden">
             {/* Background Gradient */}
             <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
             
             <div className="max-w-[450px] relative z-20">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 opacity-80">
                   Strategic Intelligence
                </div>
                <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-10 text-slate-900 tracking-tight">
                  Optimize <br /> Your Metrics
                </h2>
                <div className="flex gap-4">
                   <button className="bg-amber-500 text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-amber-500/20">
                     Start Analysis
                   </button>
                   <button className="bg-white/80 border border-black/5 text-slate-700 px-8 py-4 rounded-full font-bold text-sm hover:bg-white transition-all active:scale-95">
                     View Reports
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-4 gap-12 mt-12 relative z-20">
                <StatBadge label="Efficiency" value="84%" colorClass="bg-blue-400" />
                <StatBadge label="Tasks" value="1.2k" colorClass="bg-orange-500" />
                <StatBadge label="Growth" value="+12%" colorClass="bg-emerald-400" />
                <StatBadge label="Insights" value="28" colorClass="bg-purple-500" />
             </div>
          </div>

          {/* Character Asset - New Blurred Version from User image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute right-[-8%] top-[-10%] bottom-[-10%] w-[700px] pointer-events-none z-30 hidden lg:block"
          >
             <img 
               src="/assets/3d/user_dashboard_blurred.png" 
               alt="Character" 
               className="h-full w-full object-contain"
             />
          </motion.div>
        </div>

        {/* ── Bottom Section: Top Lists ───────────────────────────────── */}
        <div className="glass-card flex-1 p-8 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-slate-800">Performance Stream</h3>
              <div className="flex items-center gap-3">
                 <div className="text-xs font-bold text-slate-500 bg-black/5 px-3 py-1.5 rounded-lg border border-black/5 flex items-center gap-2 cursor-pointer hover:bg-black/10 transition-all">
                    By Popularity <MoreHorizontal size={14} />
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 overflow-y-auto pr-4 custom-scrollbar">
              <VideoItem 
                 title="Optimize Your Morning Routine" 
                 views="+ 4.2k views" 
                 trend={12} 
                 date="March 12, 2026"
                 thumbnail="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=200"
              />
              <VideoItem 
                 title="AI Coach Session #42" 
                 views="+ 2.8k views" 
                 trend={8} 
                 date="March 11, 2026"
                 thumbnail="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200"
              />
              <VideoItem 
                 title="Health & Fitness Analytics" 
                 views="- 1.2k views" 
                 trend={-3} 
                 date="March 10, 2026"
                 thumbnail="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=200"
              />
              <VideoItem 
                 title="Weekly Performance Review" 
                 views="+ 5.6k views" 
                 trend={24} 
                 date="March 09, 2026"
                 thumbnail="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200"
              />
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;