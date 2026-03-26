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
  Trophy,
  X
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
      {/* Premium Glass Sidebar - higher blur, slight transparency */}
      <div className="absolute inset-y-4 left-4 w-16 glass-sidebar rounded-full -z-10 shadow-2xl overflow-hidden" />
      
      {/* Brand Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#84cc16] flex items-center justify-center text-black mb-12 shadow-[0_0_20px_rgba(132,204,22,0.4)]">
        <Activity size={24} strokeWidth={3} />
      </div>

      <nav className="flex flex-col gap-8 flex-1">
        {sidebarItems.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-[#84cc16] text-black glow-active-emerald' : 'text-white/40 group-hover:text-white group-hover:bg-white/5'}`}>
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
        <div className="w-10 h-10 rounded-xl bg-[#84cc16] flex items-center justify-center text-black glow-active-emerald cursor-pointer">
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
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const features = [
    { 
      title: "AI Brain", 
      desc: "Neural optimization engine for your daily habits.", 
      longDesc: "Experience the next generation of time management. Our AI Brain analyzes your peak productivity hours, historical task completion rates, and even environmental factors to suggest the optimal schedule. It doesn't just manage your time; it optimizes your energy.",
      icon: <Sparkles size={44} className="text-[#84cc16]" />,
      variant: "glass-card",
      animation: { rotate: [0, 15, -15, 0], transition: { repeat: Infinity, duration: 4 } }
    },
    { 
      title: "Performance Monitor", 
      desc: "Real-time efficiency & focus tracking suite.", 
      longDesc: "Get a god-view of your life performance. From heart-rate synchronized focus scores to weekly momentum trends, our analytics suite provides the clarity you need to make better decisions. Every data point is a step towards your better self.",
      icon: <BarChart3 size={44} className="text-[#84cc16]" />,
      variant: "glass-card",
      animation: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 3 } }
    },
    { 
      title: "Life Synchronizer", 
      desc: "Seamless multi-device state & environment sync.", 
      longDesc: "Your schedule should follow you, not the other way around. Dynamic Life Sync ensures your tasks, health metrics, and strategic plans are available on every device, from your wristwatch to your primary workstation, with zero-latency updates.",
      icon: <Layers size={44} className="text-[#84cc16]" />,
      variant: "glass-card",
      animation: { y: [0, -8, 0], transition: { repeat: Infinity, duration: 3.5 } }
    }
  ];

  return (
    <div className="min-h-screen bg-[#06080a] text-white relative flex overflow-x-hidden pt-4 pb-20">
      <div className="smoke-bg" />
      
      <NavigationSidebar />

      <main className="flex-1 ml-28 mr-8 grid grid-cols-12 gap-8 items-start">
        
        {/* Header Branding (Mobile/Top) */}
        <header className="col-span-12 flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#84cc16] flex items-center justify-center text-black shadow-lg shadow-lime-500/10">
                <Activity size={18} strokeWidth={4} />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-[#84cc16]">Smart Life Scheduler</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => navigate("/login")}
              className="px-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
             >
                Login
             </button>
             <button 
              onClick={() => navigate("/register")}
              className="px-8 py-2.5 rounded-xl bg-[#84cc16] text-black text-[10px] font-black uppercase tracking-widest hover:bg-lime-400 transition-all shadow-xl shadow-lime-500/20"
             >
                Register
             </button>
          </div>
        </header>

        {/* --- LEFT COLUMN AREA --- */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          
          {/* HERO CARD - SOLID UI (Contrast Balance) */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#0d1116] border border-white/5 rounded-[48px] p-12 flex flex-col gap-10 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/5 blur-[120px] pointer-events-none" />
            
            <div className="flex flex-col gap-6">
              <h2 className="text-6xl font-black leading-[0.95] tracking-tighter">
                DESIGN YOUR <span className="text-[#84cc16]">LIFE.</span><br />
                MASTER YOUR <span className="text-[#84cc16]">TIME.</span>
              </h2>
              <p className="text-white/30 text-base max-w-sm leading-relaxed font-medium">
                AI-powered scheduling, intelligence analytics & adaptive flow optimization — the next level of human performance.
              </p>
            </div>

            <div className="flex items-center gap-6">
               <button 
                onClick={() => navigate(token ? "/dashboard" : "/login")}
                className="bg-[#84cc16] hover:bg-lime-400 text-black px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[3px] transition-all shadow-2xl shadow-lime-500/30 active:scale-95"
               >
                 Get Started
               </button>
               <button className="flex items-center gap-3 px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-all">
                 <Play size={16} fill="currentColor" />
                 Demo
               </button>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/5">
               <div className="flex flex-col gap-2">
                  <span className="text-3xl font-black text-[#84cc16]">98%+</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">Performance Boost</span>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-3xl font-black text-[#84cc16]">800k</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">Active Users</span>
               </div>
            </div>

            {/* Premium Glass Floating Labels (High Blur 20px) */}
            <div className="absolute top-12 right-12 flex flex-col gap-5">
               <motion.div 
                 initial={{ x: 50, opacity: 0 }}
                 whileInView={{ x: 0, opacity: 1 }}
                 className="glass-floating rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-2xl"
               >
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-500 shadow-inner">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-tight">Task Completed</span>
                    <span className="text-[9px] font-black text-[#84cc16]/60 uppercase tracking-widest">Training finished</span>
                  </div>
               </motion.div>
               <motion.div 
                 initial={{ x: 50, opacity: 0 }}
                 whileInView={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.2 }}
                 className="glass-floating rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-2xl ml-[-20px]"
               >
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-500 shadow-inner">
                    <Sparkles size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-tight">AI Suggestion</span>
                    <span className="text-[9px] font-black text-[#84cc16]/60 uppercase tracking-widest">Focus Work: 9 AM</span>
                  </div>
               </motion.div>
            </div>
          </motion.section>

          {/* PERFORMANCE MONITOR - GLASS PANEL */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-12 flex flex-col gap-10 border border-white/[0.08]"
          >
             <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-[#84cc16] uppercase tracking-[5px] flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse shadow-[0_0_10px_#84cc16]" />
                   SYSTEM ACTIVE
                </span>
                <h3 className="text-5xl font-black tracking-tighter leading-none">Strategic<br />Performance</h3>
             </div>

             <div className="flex items-center justify-between gap-8">
                <div className="flex flex-col gap-8 flex-1">
                   <div className="flex items-center gap-4">
                      <button className="bg-[#84cc16] text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2 glow-active-emerald">
                        <Zap size={14} fill="currentColor" /> PLAN MY DAY
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Focus Score</p>
                        <p className="text-2xl font-black">82%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Momentum</p>
                        <p className="text-2xl font-black">88%</p>
                      </div>
                   </div>
                </div>

                <div className="relative">
                   <div className="absolute inset-0 bg-lime-500/5 blur-3xl rounded-full" />
                   <CircularProgress value={82} label="SCORE" size={180} strokeWidth={14} />
                </div>
             </div>
          </motion.section>

        </div>

        {/* --- MIDDLE COLUMN AREA --- */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          
          {/* OPERATIONAL FLOW - SOLID PANEL */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-[#0a0d11] border border-white/5 p-10 rounded-[40px] flex flex-col gap-10 shadow-xl"
          >
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#84cc16] shadow-inner">
                      <Activity size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">Operational Flow</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Pending Priority</p>
                   </div>
                </div>
             </div>

             <div className="flex justify-between items-center py-6 border-y border-white/5 gap-2">
                {[13, 22, 25, 26, 20, 60, 59].map((day, idx) => (
                   <div key={idx} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${idx === 3 ? 'text-white' : 'text-white/15 hover:text-white/40'}`}>
                      <span className="text-[8px] font-black uppercase tracking-widest">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                      <div className={`w-12 py-4 rounded-2xl border transition-all flex items-center justify-center text-base font-black ${idx === 3 ? 'bg-[#84cc16] border-[#84cc16] text-black shadow-2xl shadow-lime-500/30' : 'bg-black/40 border-white/5'}`}>
                         {day}
                      </div>
                   </div>
                ))}
             </div>

             <div className="flex flex-col gap-5">
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all">
                   <div className="flex items-center gap-5">
                      <div className="w-2.5 h-2.5 rounded-full border-[3px] border-[#84cc16] shadow-[0_0_10px_rgba(132,204,22,0.3)]" />
                      <div>
                         <p className="text-base font-black tracking-tight">Deep Focus Logic</p>
                         <p className="text-[10px] font-black text-white/20 uppercase"><span className="text-[#84cc16]/60">6:00 PM</span> • CRITICAL</p>
                      </div>
                   </div>
                   <MoreHorizontal size={18} className="text-white/10" />
                </div>
             </div>
          </motion.section>

          {/* INTELLIGENCE OVERVIEW - GLASS PANEL */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 flex flex-col gap-10 border border-white/[0.08]"
          >
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#84cc16] shadow-inner">
                      <BarChart3 size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black tracking-tight">Intelligence</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Data Insights</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tasks Done</p>
                   <p className="text-3xl font-black mt-1 text-[#84cc16]">42</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Efficiency</p>
                   <p className="text-3xl font-black mt-1 text-[#84cc16]">94%</p>
                </div>
             </div>

             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={velocityData}>
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                         {velocityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </motion.section>

        </div>

        {/* --- RIGHT COLUMN AREA --- */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
          
          {/* SMART SYNC - GLASS PANEL */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 flex flex-col items-center gap-8 relative overflow-hidden border border-white/[0.08]"
          >
             <div className="absolute top-4 right-4">
                <div className="px-3 py-1 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/20 text-[8px] font-black text-[#84cc16] tracking-[2px]">ACTIVE</div>
             </div>
             
             <div className="flex items-center gap-4 w-full self-start">
               <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] shadow-inner">
                  <Activity size={20} strokeWidth={3} />
               </div>
               <h4 className="text-base font-black uppercase tracking-tighter">Smart Sync</h4>
             </div>
             
             <div className="w-full flex justify-center py-4">
                <CircularProgress value={82} label="SYNC" size={140} strokeWidth={12} />
             </div>

             <button className="w-full py-5 rounded-2xl bg-[#84cc16] text-black text-[10px] font-black uppercase tracking-[3px] shadow-2xl shadow-lime-500/30 glow-active-emerald active:scale-95 transition-all">
                OPTIMIZE NOW
             </button>
          </motion.section>

          {/* GROWTH CURVE - SOLID PANEL */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-[#0a0d11] border border-white/5 p-8 rounded-[40px] flex flex-col gap-8 shadow-xl"
          >
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#84cc16] shadow-inner">
                      <Target size={20} />
                   </div>
                   <h4 className="text-base font-black uppercase tracking-tighter">Velocity</h4>
                </div>
             </div>

             <div className="h-40 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={performanceData}>
                      <defs>
                         <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </motion.section>

          {/* AI ASSISTANT TRIGGER */}
          <div className="mt-auto flex items-center gap-5 bg-[#84cc16] text-black px-8 py-5 rounded-[32px] shadow-[0_20px_40px_rgba(132,204,22,0.3)] cursor-pointer hover:scale-105 transition-all group glow-active-emerald">
             <div className="w-3 h-3 rounded-full bg-black animate-ping" />
             <span className="text-sm font-black uppercase tracking-widest">Connect AI</span>
             <Bot size={24} className="group-hover:rotate-12 transition-transform" />
          </div>

        </div>

        {/* --- PREMIUM FEATURE GRID - LIQUID GLASS PANELS --- */}
        <section className="col-span-12 mt-32 mb-40 px-4">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center text-center gap-5 mb-24"
            >
               <span className="text-[10px] font-black text-[#84cc16] uppercase tracking-[8px]">CORE SYSTEMS</span>
               <h3 className="text-7xl font-black tracking-tight uppercase leading-[0.9] text-white">INTELLIGENT <span className="text-[#84cc16]">UNITS</span></h3>
               <p className="text-white/30 text-lg max-w-xl font-medium mt-4">Unlocking hyper-performance through layered glassmorphism and neural optimization.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
               {features.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    layoutId={`feature-${idx}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -15, zIndex: 10 }}
                    onClick={() => setSelectedFeature({ ...feature, id: idx })}
                    className="glass-card p-16 rounded-[64px] flex flex-col items-center text-center gap-10 border border-white/[0.08] cursor-pointer group relative overflow-hidden hover:border-[#84cc16]/30 transition-all shadow-2xl"
                  >
                     <div className="absolute inset-0 bg-lime-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity blur-[60px] pointer-events-none" />
                     
                     {/* Gradient Border Glow */}
                     <div className="absolute inset-0 rounded-[64px] border border-white/5 group-hover:border-[#84cc16]/20 transition-all pointer-events-none" />

                     <motion.div 
                       animate={feature.animation}
                       className="w-28 h-28 rounded-[40px] bg-white/[0.03] flex items-center justify-center mb-4 border border-white/5 group-hover:border-[#84cc16]/40 transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                     >
                        {feature.icon}
                     </motion.div>

                     <div className="flex flex-col gap-4">
                        <h4 className="text-4xl font-black tracking-tight text-white group-hover:text-[#84cc16] transition-colors leading-none">{feature.title}</h4>
                        <p className="text-base text-white/30 leading-relaxed font-semibold px-2">{feature.desc}</p>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-4 px-6 py-2 rounded-full bg-white/[0.02] border border-white/5">
                        <motion.div 
                          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ repeat: Infinity, duration: 2.5 }}
                          className="w-2 h-2 rounded-full bg-[#84cc16] shadow-[0_0_10px_#84cc16]"
                        />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">ACTIVE UNIT</span>
                     </div>
                  </motion.div>
               ))}
            </div>
        </section>

      </main>

      {/* PREMIUM GLASS MODAL */}
      <AnimatePresence>
        {selectedFeature && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedFeature(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-[40px]"
              />
              <motion.div 
                layoutId={`feature-${selectedFeature.id}`}
                className="relative bg-[#080a0d] border border-white/[0.1] rounded-[72px] p-16 max-w-3xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                 <div className="absolute top-10 right-10">
                    <button 
                      onClick={() => setSelectedFeature(null)}
                      className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-xl"
                    >
                       <X size={24} />
                    </button>
                 </div>

                 <div className="flex flex-col gap-12">
                    <div className="flex items-center gap-12">
                       <motion.div 
                         initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                         animate={{ scale: 1, rotate: 0, opacity: 1 }}
                         transition={{ type: "spring", damping: 15 }}
                         className="w-40 h-40 rounded-[50px] bg-[#84cc16]/10 flex items-center justify-center text-[#84cc16] border border-[#84cc16]/20 shadow-[inset_0_0_30px_rgba(132,204,22,0.1)]"
                       >
                          {selectedFeature.icon}
                       </motion.div>
                       <div className="flex flex-col gap-4">
                          <h2 className="text-6xl font-black tracking-tight leading-none text-white">{selectedFeature.title}</h2>
                          <div className="flex items-center gap-4">
                             <div className="px-5 py-2 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/20 text-[10px] font-black text-[#84cc16] uppercase tracking-[3px]">DEPLOYED</div>
                             <div className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.07] text-[10px] font-black text-white/30 uppercase tracking-[3px]">ENCRYPTED</div>
                          </div>
                       </div>
                    </div>

                    <p className="text-2xl text-white/50 leading-relaxed font-semibold max-w-2xl">
                       {selectedFeature.longDesc}
                    </p>
                    
                    <button 
                      onClick={() => setSelectedFeature(null)}
                      className="w-full py-7 rounded-[32px] bg-[#84cc16] text-black text-base font-black uppercase tracking-[6px] hover:bg-lime-400 transition-all shadow-2xl shadow-lime-500/40 glow-active-emerald"
                    >
                       ACCESS MODULE
                    </button>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* STRATEGIC DECORATIVE ELEMENTS */}
      <div className="fixed top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#84cc16]/5 blur-[200px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#84cc16]/5 blur-[200px] rounded-full -z-10 animate-pulse" />

    </div>
  );
}

export default Landing;
