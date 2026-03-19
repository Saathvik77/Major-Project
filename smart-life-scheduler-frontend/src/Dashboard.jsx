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
  MessageSquare
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XContainer, YAxis, Tooltip } from 'recharts';

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
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);

const VideoItem = ({ title, views, date, thumbnail, trend }) => (
  <div className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-2xl transition-all cursor-pointer">
    <div className="w-16 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative">
       <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold text-white truncate">{title}</div>
      <div className="text-[10px] text-gray-500">{date}</div>
    </div>
    <div className="flex flex-col items-end gap-1">
       <div className="text-xs font-bold text-gray-300">{views}</div>
       <div className={`text-[10px] font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
         {trend > 0 ? '+' : ''}{trend}%
       </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-transparent pl-[84px] text-white overflow-hidden page-transition">
      {/* ── Main Container ────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 flex flex-col gap-8 h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Channel Analytics</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer">
              <Search size={20} />
            </div>
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer relative">
              <Bell size={20} />
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#131314]" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        {/* ── Top Section: Banners & Character ────────────────────────── */}
        <div className="relative grid grid-cols-12 gap-6 min-h-[400px]">
          
          {/* Main Hero Banner */}
          <div className="col-span-12 lg:col-span-8 glass-card p-10 flex flex-col justify-between relative overflow-hidden">
             {/* Background Gradient */}
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
             
             <div className="max-w-[300px] relative z-20">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 opacity-60">
                   Popular Selection
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-8">
                  Optimize <br /> Your Metrics
                </h2>
                <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-white/10">
                  Start Now
                </button>
             </div>

             <div className="grid grid-cols-4 gap-8 mt-12 relative z-20">
                <StatBadge label="Likes" value="76k" colorClass="bg-blue-400" />
                <StatBadge label="Views" value="1.5m" colorClass="bg-orange-500" />
                <StatBadge label="Sales" value="$3,6k" colorClass="bg-emerald-400" />
                <StatBadge label="Posts" value="47" colorClass="bg-purple-500" />
             </div>
          </div>

          {/* Character Asset - Overlays Banner and Next Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute right-[22%] top-[-20%] bottom-0 w-[450px] pointer-events-none z-30 hidden lg:block"
          >
             <img 
               src="/assets/3d/dashboard_character.png" 
               alt="Character" 
               className="h-full w-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
             />
          </motion.div>

          {/* Right Metrics Card */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             <div className="glass-card flex-1 p-6 relative flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Active Users <span className="text-white/40 font-normal">right now</span></div>
                  <Users size={16} className="text-gray-500" />
                </div>
                <div className="text-3xl font-black mb-2">362</div>
                
                {/* Mini Sparkline Chart */}
                <div className="h-[120px] w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff9d00" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ff9d00" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#ff9d00" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="glass-card h-[140px] p-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Latest Sales</div>
                   <div className="text-3xl font-black text-amber-glow">$ 586</div>
                   <div className="text-[10px] text-emerald-400 font-bold">+12.5% vs last week</div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center p-2 relative">
                   <img src="https://api.dicebear.com/7.x/shapes/svg?seed=backpack" alt="Product" className="w-full h-full object-contain opacity-80" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
             </div>
          </div>
        </div>

        {/* ── Bottom Section: Top Lists ───────────────────────────────── */}
        <div className="glass-card flex-1 p-8 overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg">Your Top Performance in this period</h3>
              <div className="flex items-center gap-3">
                 <div className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                    Popularity <MoreHorizontal size={14} />
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