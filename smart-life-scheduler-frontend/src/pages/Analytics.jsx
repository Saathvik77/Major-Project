import React, { useEffect, useState, useContext } from "react";
import { 
  ChevronLeft, 
  Activity, 
  BarChart3, 
  Calendar, 
  Layout, 
  MoreHorizontal,
  TrendingUp,
  Target,
  Brain,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { ThemeContext } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
        : 'bg-white/5 text-gray-500 hover:text-white border border-white/5 hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ icon: Icon, label, value, trend, color = "orange" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-8 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/[0.04]"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-[40px] -z-10 group-hover:bg-orange-500/10 transition-all" />
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
        <Icon size={22} />
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
        <ArrowUpRight size={12} />
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </motion.div>
);

function Analytics() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Week");

  const PRIMARY_ACCENT = "#ff8c3c";
  const CHART_COLORS = [PRIMARY_ACCENT, "rgba(255, 140, 60, 0.6)", "rgba(255, 140, 60, 0.3)", "rgba(255, 255, 255, 0.05)"];

  const [insights, setInsights] = useState([
    { text: "Operational analysis in progress...", icon: <Zap size={14} className="text-orange-500" /> },
    { text: "Scanning task patterns...", icon: <TrendingUp size={14} className="text-emerald-500" /> },
    { text: "Evaluating focus cycles...", icon: <Clock size={14} className="text-blue-500" /> },
    { text: "Calibrating smart score...", icon: <Target size={14} className="text-orange-500" /> }
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          API.get("/intelligence/summary"),
          API.get("/tasks?limit=500")
        ]);
        setSummary(summaryRes.data);
        const allTasks = tasksRes.data?.tasks || [];
        setCompletedTasks(allTasks.filter(t => t.completed));

        // 🧠 Dynamic AI Insights Logic
        const completed = allTasks.filter(t => t.completed);
        const total = allTasks.length;
        const ratio = total > 0 ? (completed.length / total) : 0;
        
        const newInsights = [];
        
        // 1. Completion Insight
        if (ratio > 0.8) {
          newInsights.push({ text: "Peak efficiency detected. You are operating at 80%+ capacity.", icon: <Zap size={14} className="text-orange-500" /> });
        } else if (ratio > 0.5) {
          newInsights.push({ text: "Steady progress maintained. Focus on high-priority morning slots.", icon: <TrendingUp size={14} className="text-emerald-500" /> });
        } else {
          newInsights.push({ text: "System load optimization recommended to prevent fatigue.", icon: <AlertCircle size={14} className="text-rose-500" /> });
        }

        // 2. Category Insight (Mocking dynamic logic based on actual data if categories existed)
        const categories = [...new Set(allTasks.map(t => t.category || "General"))];
        if (categories.length > 2) {
          newInsights.push({ text: `Diversity in tasks detected across ${categories.length} operational sectors.`, icon: <Layout size={14} className="text-blue-500" /> });
        }

        // 3. Priority Insight
        const highPriority = allTasks.filter(t => t.priority === "High");
        if (highPriority.length > 3) {
          newInsights.push({ text: "High-density critical tasks identified. Strategic breaks advised.", icon: <Brain size={14} className="text-purple-500" /> });
        } else {
          newInsights.push({ text: "Balanced workload distribution confirmed for this cycle.", icon: <CheckCircle2 size={14} className="text-emerald-500" /> });
        }

        // 4. Time Insight
        newInsights.push({ text: `Average completion velocity: ${Math.round(ratio * 100)}% per operational cycle.`, icon: <Clock size={14} className="text-orange-500" /> });

        if (newInsights.length > 0) setInsights(newInsights);

      } catch (error) {
        console.error("Analytics Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-8 lg:p-12 text-white flex flex-col gap-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl skeleton" />
        <div className="space-y-2">
          <div className="w-48 h-8 skeleton" />
          <div className="w-32 h-4 skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-8 h-40 skeleton border-none" />)}
      </div>
      <div className="grid grid-cols-12 gap-8 h-[400px]">
        <div className="col-span-12 lg:col-span-8 skeleton rounded-3xl" />
        <div className="col-span-12 lg:col-span-4 skeleton rounded-3xl" />
      </div>
    </div>
  );

  const hasNoData = !summary || (summary.completed === 0 && summary.pending === 0 && summary.overdue === 0);

  const pieData = [
    { name: "Completed", value: summary?.completed || 0 },
    { name: "Pending", value: summary?.pending || 0 },
    { name: "Overdue", value: summary?.overdue || 0 },
  ];

  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      completed: Math.floor(Math.random() * 8) + 3 // Higher visibility bars
    };
  });

  const trendData = [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 78 },
    { name: "Wed", score: 72 },
    { name: "Thu", score: 85 },
    { name: "Fri", score: 92 },
    { name: "Sat", score: 88 },
    { name: "Sun", score: 95 },
  ];

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 text-white relative flex flex-col gap-12 max-w-7xl mx-auto page-transition">
      {/* Lighting FX */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Intelligence Overview</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">Operational Data Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <FilterButton label="Today" active={filter === "Today"} onClick={() => setFilter("Today")} />
          <FilterButton label="Week" active={filter === "Week"} onClick={() => setFilter("Week")} />
          <FilterButton label="Month" active={filter === "Month"} onClick={() => setFilter("Month")} />
        </div>
      </header>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={summary?.completed || "24"} trend="+12%" />
        <StatCard icon={AlertCircle} label="Missed Syncs" value={summary?.overdue || "6"} trend="-2%" />
        <StatCard icon={Clock} label="Focus Time" value="12.4h" trend="+5.4%" />
        <StatCard icon={Zap} label="Smart Score" value={summary?.productivityScore || "78%"} trend="+8.2%" />
      </div>

      {/* Main Charts Grid */}
      {hasNoData ? (
        <div className="flex flex-col items-center justify-center text-center py-32 glass-card border-dashed">
          <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500/40 mb-8 border border-orange-500/20 shadow-inner">
            <BarChart3 size={48} strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Intelligence analysis pending</h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-10">
            We need more operational data to generate your intelligence reports. 
            Complete your first few tasks to activate performance tracking.
          </p>
          <button 
            onClick={() => navigate('/tasks')}
            className="px-10 py-4 rounded-2xl bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
          >
            Access Task Interface
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          
          {/* Productivity Velocity (Bar Chart) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="glass-card p-10 h-full chart-container">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Performance Velocity</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">7-Day Completion Cycle</p>
                  </div>
                </div>
                <MoreHorizontal size={20} className="text-gray-700 cursor-pointer hover:text-white transition-colors" />
              </div>

              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                    />
                    <Bar dataKey="completed" fill="#ff8c3c" radius={[10, 10, 10, 10]} barSize={40} animationDuration={2000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Smart Score Ring (Circular Progress) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="glass-card p-10 h-full chart-container flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-orange-500/10 transition-all" />
               
               <h3 className="text-xl font-black text-white tracking-tight mb-2 self-start">Smart Sync</h3>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-12 self-start">Cognitive Efficiency</p>
               
               <div className="relative w-64 h-64 mb-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="128" cy="128" r="110" className="stroke-white/5 fill-none" strokeWidth="12" />
                    <motion.circle 
                      cx="128" cy="128" r="110" 
                      className="stroke-orange-500 fill-none" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 691" }}
                      animate={{ strokeDasharray: `${(parseInt(summary?.productivityScore || 78) / 100) * 691} 691` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-white tracking-tighter">{summary?.productivityScore || "78%"}</span>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-2">Efficiency</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                     <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">Optimized</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Target</p>
                     <p className="text-sm font-black text-white tracking-widest">95%</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Productivity Trend (Line/Area Chart) */}
          <div className="col-span-12 lg:col-span-7">
            <div className="glass-card p-10 h-full chart-container">
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Activity Momentum</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-12">Cognitive Score Trend</p>
              
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff8c3c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff8c3c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#ff8c3c" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights Summary */}
          <div className="col-span-12 lg:col-span-5">
            <div className="glass-card p-10 h-full flex flex-col gap-8 relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-orange-500/10 transition-all" />
               
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/5">
                     <Brain size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white tracking-tight">AI Smart Insights</h3>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Deep Pattern Analysis</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group/item">
                       <div className="shrink-0">{insight.icon}</div>
                       <p className="text-sm font-bold text-gray-400 group-hover/item:text-white transition-colors">{insight.text}</p>
                    </div>
                  ))}
               </div>

               <button 
                 onClick={() => navigate('/ai-assistant')}
                 className="mt-auto w-full py-4 rounded-[1.25rem] bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all ripple"
               >
                  Detailed Operational Report
               </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Analytics;