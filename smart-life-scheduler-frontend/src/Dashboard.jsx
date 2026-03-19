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

const StatBadge = ({ dotColor, label, value }) => (
  <div className="flex flex-col gap-1 min-w-[120px]">
    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </div>
    <div className="text-2xl font-black text-slate-800 tracking-tighter">{value}</div>
  </div>
);

const VideoItem = ({ title, views, date, thumbnail, trend }) => (
  <div className="flex items-center gap-4 group p-3 hover:bg-white/60 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-black/5">
    <div className="w-16 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
       <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
    </div>
    <div className="flex-1 min-w-0 px-1">
      <div className="text-[13px] font-bold text-slate-800 truncate">{title}</div>
      <div className="text-[10px] text-slate-400 font-medium">{date}</div>
    </div>
    <div className="flex flex-col items-end gap-0.5">
       <div className="text-xs font-bold text-slate-700">{views}</div>
       <div className={`text-[10px] font-black tracking-tight ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
         {trend > 0 ? '+' : ''}{trend}%
       </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-transparent pl-[84px] text-slate-800 overflow-hidden page-transition">
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-4 h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <Bot size={20} strokeWidth={3} />
             </div>
             <h1 className="text-lg font-black tracking-tight text-slate-900">Channel Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/60 border border-black/5 p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer backdrop-blur-md">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <div className="bg-white/60 border border-black/5 p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer relative backdrop-blur-md">
              <Bell size={18} strokeWidth={2.5} />
              <div className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200 border border-black/5 overflow-hidden transition-all cursor-pointer">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* ── Main Hero Card ────────────────────────────────────────── */}
        <div className="relative">
          <div className="glass-card bg-[#fffcf8]/40 border-white/60 p-12 flex flex-col justify-between relative overflow-hidden min-h-[460px]">
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
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                />
             </motion.div>

             <div className="relative z-20">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 opacity-80">
                   Strategic Intelligence
                </div>
                
                <h2 className="text-6xl lg:text-7xl font-black leading-[1.05] mb-12 text-slate-900 tracking-tighter">
                  Optimize <br /> Your Metrics
                </h2>
                
                <div className="flex gap-4 mb-20">
                   <button className="bg-orange-500 text-white px-10 py-4 rounded-full font-black text-[11px] hover:scale-105 transition-all active:scale-95 shadow-xl shadow-orange-500/25 uppercase tracking-widest">
                     Start Analysis
                   </button>
                   <button className="bg-white/60 border border-black/5 text-slate-700 px-8 py-4 rounded-full font-black text-[11px] hover:bg-white transition-all active:scale-95 uppercase tracking-widest">
                     View Reports
                   </button>
                </div>

                <div className="flex gap-12 pt-8">
                   <StatBadge dotColor="bg-blue-400" label="Efficiency" value="84%" />
                   <StatBadge dotColor="bg-orange-500" label="Tasks" value="1.2k" />
                   <StatBadge dotColor="bg-emerald-400" label="Growth" value="+12%" />
                   <StatBadge dotColor="bg-purple-500" label="Insights" value="28" />
                </div>
             </div>
          </div>
        </div>

        {/* ── Bottom Section: Performance Stream ────────────────────────── */}
        <div className="mt-2 flex-1 min-h-0 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-lg text-slate-800 tracking-tight">Performance Stream</h3>
              <div className="flex items-center gap-3">
                 <div className="text-[10px] font-black text-slate-500 bg-white/60 px-4 py-2 rounded-xl border border-black/5 flex items-center gap-2 cursor-pointer hover:bg-white transition-all uppercase tracking-widest">
                    By Popularity <MoreHorizontal size={14} />
                 </div>
              </div>
           </div>

           <div className="glass-card flex-1 p-4 overflow-hidden bg-white/30 border-white/50 backdrop-blur-xl">
             <div className="grid md:grid-cols-2 gap-x-12 gap-y-1.5 h-full overflow-y-auto pr-2 custom-scrollbar">
                <VideoItem 
                   title="Optimize Your Morning Routine" 
                   views="+ 4.2k views" 
                   trend={12} 
                   date="Mar 12, 2026"
                   thumbnail="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="AI Coach Session #42" 
                   views="+ 2.8k views" 
                   trend={8} 
                   date="Mar 11, 2026"
                   thumbnail="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="Health & Fitness Analytics" 
                   views="- 1.2k views" 
                   trend={-3} 
                   date="Mar 10, 2026"
                   thumbnail="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=200"
                />
                <VideoItem 
                   title="Weekly Performance Review" 
                   views="+ 5.6k views" 
                   trend={24} 
                   date="Mar 09, 2026"
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