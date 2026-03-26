import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  ClipboardList, 
  BarChart3, 
  Layers, 
  User, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Activity,
  Calendar,
  MoreHorizontal,
  Bot,
  LogOut,
  Bell,
  Target,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";

// Simulated Data for Charts
const performanceData = [
  { name: '00', value: 30 },
  { name: '04', value: 45 },
  { name: '08', value: 35 },
  { name: '12', value: 65 },
  { name: '16', value: 55 },
  { name: '20', value: 85 },
  { name: '24', value: 40 },
];

const velocityData = [
  { day: 'MON', value: 80, color: '#84cc16' },
  { day: 'TUE', value: 65, color: '#84cc16' },
  { day: 'WED', value: 45, color: '#3f6212' },
  { day: 'THU', value: 90, color: '#84cc16' },
  { day: 'FRI', value: 75, color: '#84cc16' },
  { day: 'SAT', value: 40, color: '#3f6212' },
  { day: 'SUN', value: 55, color: '#3f6212' },
];

const CircularProgress = ({ value, label, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#84cc16"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{value}%</span>
        {label && <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>}
      </div>
    </div>
  );
};

const NavigationSidebar = () => {
  const sidebarItems = [
    { icon: <Home size={20} />, label: "Home", active: true },
    { icon: <ClipboardList size={20} />, label: "Tasks" },
    { icon: <BarChart3 size={20} />, label: "Normalize" },
    { icon: <Layers size={20} />, label: "Stories" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-24 flex flex-col items-center py-8 z-50 overflow-hidden">
      {/* Sidebar background - matching the long capsule shape in the image */}
      <div className="absolute inset-y-4 left-4 w-16 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full -z-10 shadow-2xl" />
      
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#84cc16] flex items-center justify-center text-black mb-12 shadow-[0_0_20px_rgba(132,204,22,0.4)]">
        <Activity size={24} strokeWidth={3} />
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {sidebarItems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-[#84cc16] text-black shadow-lg shadow-lime-500/20' : 'text-white/40 group-hover:text-white group-hover:bg-white/5'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wide transition-all ${item.active ? 'text-[#84cc16]' : 'text-white/20 group-hover:text-white/40'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Profile Section at bottom of sidebar */}
      <div className="flex flex-col items-center gap-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#84cc16] flex items-center justify-center text-black shadow-lg shadow-lime-500/20 cursor-pointer">
          <User size={20} />
        </div>
        <div className="text-white/20 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft size={20} />
        </div>
      </div>
    </aside>
  );
};

function Landing() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative flex overflow-x-hidden pt-4 pb-20">
      <div className="smoke-bg" />
      
      <NavigationSidebar />

      <main className="flex-1 ml-28 mr-8 grid grid-cols-12 gap-6 items-start">
        
        {/* Header Branding (Mobile/Top) */}
        <header className="col-span-12 flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded-md bg-[#84cc16] flex items-center justify-center text-black">
                <Activity size={14} strokeWidth={4} />
             </div>
             <h1 className="text-lg font-black tracking-tight text-[#84cc16]">Smart Life Scheduler</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-4 py-1.5 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <Target size={14} className="text-[#84cc16]" />
                SESSION
             </div>
          </div>
        </header>

        {/* --- LEFT COLUMN AREA (Hero & Performance) --- */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* HERO CARD - LIQUID GLASS */}
          <section className="liquid-glass liquid-glass-emerald rounded-[40px] p-10 flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col gap-4">
              <h2 className="text-5xl font-black leading-tight tracking-tighter">
                Design Your <span className="text-[#84cc16]">Life.</span><br />
                Master Your <span className="text-[#84cc16]">Time.</span>
              </h2>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                AI-powered scheduling, intelligent analytics & adaptive life optimization — all in one powerful system.
              </p>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={() => navigate(token ? "/dashboard" : "/login")}
                className="bg-[#84cc16] hover:bg-lime-400 text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-lime-500/20 active:scale-95"
               >
                 Get Started
               </button>
               <button className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
                 <Play size={14} fill="currentColor" />
                 Watch Demo
               </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
               <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-[#84cc16]">98%+</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Task Completion Boost</span>
               </div>
               <div className="flex flex-col gap-1 text-left">
                  <span className="text-2xl font-black text-[#84cc16]">800st</span>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Schedules Optimized</span>
               </div>
            </div>

            {/* floating badges (AI interaction look) */}
            <div className="absolute top-10 right-10 flex flex-col gap-3">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-500">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black">Task Completed</span>
                    <span className="text-[8px] text-white/40">Gym workout finished</span>
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center gap-3 ml-[-20px]">
                  <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-500">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black">AI Suggestion</span>
                    <span className="text-[8px] text-white/40">Focus work at 9:00 AM</span>
                  </div>
               </div>
            </div>
          </section>

          {/* STRATEGIC PERFORMANCE CARD */}
          <section className="glass-card p-10 flex flex-col gap-8">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse" />
                   System Active
                </span>
                <h3 className="text-4xl font-black tracking-tighter">Strategic<br />Performance</h3>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                      <button className="bg-[#84cc16] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap size={14} fill="currentColor" /> PLAN MY DAY
                      </button>
                      <button className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                        + QUICK TASK
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-x-12 gap-y-6 pt-4">
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Focus Score</p>
                        <p className="text-xl font-black">82%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Completed</p>
                        <p className="text-xl font-black">9</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Momentum</p>
                        <p className="text-xl font-black">88%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Missed</p>
                        <p className="text-xl font-black text-rose-500">0</p>
                      </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 bg-lime-500/10 blur-3xl rounded-full" />
                   <CircularProgress value={82} label="EFFICIENCY" size={200} strokeWidth={16} />
                </div>
             </div>
          </section>

          {/* USER MINI PROFILE BOTTOM */}
          <section className="glass-card p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#84cc16] flex items-center justify-center text-black">
                   <User size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-black tracking-tight leading-none">GS ROHITH</h4>
                   <p className="text-[10px] font-black text-[#84cc16] uppercase mt-1 tracking-widest">SYSTEM ARCHITECT</p>
                </div>
             </div>
             <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all flex items-center gap-2 group">
                <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                Terminate Session
             </button>
          </section>

        </div>

        {/* --- MIDDLE COLUMN AREA (Flow & Overview) --- */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* OPERATIONAL FLOW CARD */}
          <section className="glass-card p-8 flex flex-col gap-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[#84cc16]">
                      <Activity size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black tracking-tight leading-none">Operational Flow</h3>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Pending prioritized tasks</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                   <span className="text-[10px] font-black text-[#84cc16]">HEALTHY</span>
                </div>
             </div>

             {/* CALENDAR STRIP */}
             <div className="flex justify-between items-center py-4 border-y border-white/5">
                {[13, 22, 25, 26, 20, 60, 59].map((day, idx) => (
                   <div key={idx} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${idx === 3 ? 'text-white' : 'text-white/20'}`}>
                      <span className="text-[8px] font-black uppercase tracking-widest">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][idx]}</span>
                      <div className={`w-10 py-3 rounded-xl border transition-all flex items-center justify-center text-sm font-black ${idx === 3 ? 'bg-[#84cc16] border-[#84cc16] text-black shadow-lg shadow-lime-500/20' : 'bg-black/20 border-white/5'}`}>
                         {day}
                      </div>
                   </div>
                ))}
             </div>

             {/* PLANNED SCHEDULE */}
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Planned Schedule</span>
                   <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:text-[#84cc16] transition-colors">SEE FULL CALENDAR</button>
                </div>

                <div className="flex flex-col gap-3">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-[#84cc16]/5 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full border-2 border-[#84cc16]" />
                         <div>
                            <p className="text-sm font-black">Gym - Leg Day</p>
                            <p className="text-[10px] font-black text-white/20 uppercase"><span className="text-[#84cc16]">6:00 PM</span> • GENERAL</p>
                         </div>
                      </div>
                      <MoreHorizontal size={16} className="text-white/20" />
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-[#84cc16]/5 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full border-2 border-white/10" />
                         <div>
                            <p className="text-sm font-black text-white/40">Medium</p>
                            <p className="text-[10px] font-black text-white/10 uppercase"><span className="text-white/20">8:30 PM</span> • GENERAL</p>
                         </div>
                      </div>
                      <MoreHorizontal size={16} className="text-white/10" />
                   </div>
                </div>
             </div>
          </section>

          {/* INTELLIGENCE OVERVIEW */}
          <section className="glass-card p-8 flex flex-col gap-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-[#84cc16]">
                      <BarChart3 size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black tracking-tight leading-none">Intelligence Overview</h3>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Data-driven performance insights</p>
                   </div>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl">
                    <button className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/20">TODAY</button>
                    <button className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/20">WEEK</button>
                    <button className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[#84cc16] text-black">MONTH</button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Completed Tasks</p>
                   <p className="text-2xl font-black mt-1">9</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Missed Syncs</p>
                   <p className="text-2xl font-black mt-1 flex items-center gap-2">0 <div className="w-1 h-1 rounded-full bg-rose-500" /></p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                   <p className="text-[9px] font-black text-[#84cc16] uppercase tracking-widest">6-112 %</p>
                   <p className="text-2xl font-black mt-1">940h</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                   <p className="text-[9px] font-black text-[#84cc16] uppercase tracking-widest flex items-center gap-2">Focus Score <div className="w-1 h-1 rounded-full bg-[#84cc16]" /></p>
                   <p className="text-2xl font-black mt-1">8.2h</p>
                </div>
             </div>

             <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Performance Velocity</span>
                <div className="h-28 w-full mt-2">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={velocityData}>
                         <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {velocityData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex justify-between px-2">
                   {['00', '04', '08', '12', '16', '20', '24'].map(h => (
                      <span key={h} className="text-[8px] font-black text-white/20">{h}</span>
                   ))}
                </div>
             </div>
          </section>

          {/* PERSONAL LOGS */}
          <section className="glass-card p-8 flex flex-col gap-6">
             <h3 className="text-xl font-black tracking-tight leading-none">Personal Profile</h3>
             <div className="flex flex-col gap-4">
                {[
                  { title: "Completed Operational Log", sub: "Operational Review - Week 1", val: "+817.06", icon: <CheckCircle2 size={16} className="text-[#84cc16]" /> },
                  { title: "Morning Waking", sub: "Cardiovascular - Health Metric", val: "+567.92", icon: <Activity size={16} className="text-[#84cc16]" /> },
                  { title: "Cricket World Cup Push", sub: "MAR 2", val: "+957.98", icon: <Trophy size={16} className="text-[#84cc16]" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#84cc16]/10 group-hover:text-[#84cc16] transition-all">
                           {item.icon}
                        </div>
                        <div>
                           <p className="text-[11px] font-black">{item.title}</p>
                           <p className="text-[9px] font-black text-white/20 uppercase">{item.sub}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-white/40">{item.val}</span>
                  </div>
                ))}
             </div>
          </section>

        </div>

        {/* --- RIGHT COLUMN AREA (Trends & Achievements) --- */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* SMART SYNC RADIUS */}
          <section className="glass-card p-8 flex flex-col items-center gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2">
                <div className="px-2 py-0.5 rounded bg-[#84cc16]/10 border border-[#84cc16]/20 text-[7px] font-black text-[#84cc16]">ACTIVE</div>
             </div>
             
             <div className="flex items-center gap-3 w-full self-start">
               <div className="w-8 h-8 rounded-lg bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16]">
                  <Activity size={16} strokeWidth={3} />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest tracking-tighter">Smart Sync</h4>
             </div>
             
             <p className="text-[10px] text-white/30 leading-relaxed text-center px-4">
               Detected 0 missed syncs. Our smart engine can automatically find the next optimal window based on your performance patterns.
             </p>

             <button className="w-full py-4 rounded-2xl bg-[#84cc16] text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-500/20 active:scale-95 transition-all">
                + APPLY SMART OPTIMIZATION
             </button>

             <div className="w-full flex justify-center py-6">
                <CircularProgress value={82} label="SYNC" size={120} strokeWidth={10} />
             </div>

             <div className="flex justify-between w-full px-4 border-t border-white/5 pt-4">
                <div className="text-center">
                   <p className="text-[8px] font-black text-white/20 uppercase">Target</p>
                   <p className="text-xs font-black">98.5 %</p>
                </div>
             </div>
          </section>

          {/* CHART STOCK STYLE */}
          <section className="glass-card p-8 flex flex-col gap-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#84cc16]">
                      <Activity size={16} />
                   </div>
                   <h4 className="text-sm font-black uppercase tracking-widest">Growth Curve</h4>
                </div>
                <button className="text-white/20 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
             </div>

             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={performanceData}>
                      <defs>
                         <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>

             <button className="w-full py-4 rounded-2xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                Detailed Operation Report
             </button>
          </section>

          {/* ACHIEVEMENTS */}
          <section className="glass-card p-6 flex flex-col gap-6">
             <h4 className="text-sm font-black uppercase tracking-widest text-white/40">Achievements</h4>
             <div className="flex gap-4">
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                   <CheckCircle2 size={16} className="text-[#84cc16]" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Steady Operation</span>
                </div>
                <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                   <Zap size={16} className="text-[#84cc16]" strokeWidth={3} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Focus Optimized</span>
                </div>
             </div>
          </section>

          {/* AI COACH BUBBLE BOTTOM RIGHT */}
          <div className="self-end mt-auto flex items-center gap-4 bg-[#84cc16] text-black px-6 py-4 rounded-[30px] shadow-2xl shadow-lime-500/40 cursor-pointer hover:scale-105 transition-all group">
             <div className="w-2 h-2 rounded-full bg-black animate-ping" />
             <span className="text-xs font-black uppercase tracking-tighter">Ask AI Coach</span>
             <Bot size={20} className="group-hover:rotate-12 transition-transform" />
          </div>

        </div>

      </main>

      {/* FLOATING ACTION BLURS */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-500/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-500/5 blur-[120px] rounded-full -z-10" />

    </div>
  );
}

export default Landing;
