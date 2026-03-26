import React, { useEffect, useState, useContext, useMemo } from "react";
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
    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
      active 
        ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/20' 
        : 'bg-white/5 text-gray-500 hover:text-white border border-white/5 hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

const formatTime12Hour = (time24) => {
  if (!time24) return "—";
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};
const StatCard = ({ icon: Icon, title, value, trend, trendUp, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="glass-card p-3 sm:p-5 flex flex-col justify-between min-h-[120px] md:min-h-[180px] relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-[25px] -z-10`} />
    <div className="flex items-center justify-between mb-1.5">
      <div className={`p-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-500`}>
        <Icon size={16} className="sm:w-6 sm:h-6" />
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div>
      <p className="text-xs font-black text-gray-500 uppercase tracking-wide leading-none truncate">{title}</p>
      <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tighter mt-1">{value}</h3>
    </div>
  </motion.div>
);

function Analytics() {
  const navigate = useNavigate();
   const [summary, setSummary] = useState(null);
   const [allTasks, setAllTasks] = useState([]);
   const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Week");

  const PRIMARY_ACCENT = "#84cc16";
  const CHART_COLORS = [PRIMARY_ACCENT, "rgba(132, 204, 22, 0.6)", "rgba(132, 204, 22, 0.3)", "rgba(255, 255, 255, 0.05)"];

  const currentInsights = useMemo(() => {
    if (!allTasks.length) return [
      { text: "Operational analysis in progress...", icon: <Zap size={14} className="text-lime-500" /> },
      { text: "Scanning task patterns...", icon: <TrendingUp size={14} className="text-emerald-500" /> },
      { text: "Evaluating focus cycles...", icon: <Clock size={14} className="text-blue-500" /> },
      { text: "Calibrating smart score...", icon: <Target size={14} className="text-lime-500" /> }
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const filteredTasks = filter === "Today" 
      ? allTasks.filter(t => t.date && new Date(t.date).toISOString().split('T')[0] === todayStr)
      : allTasks;

    const completed = filteredTasks.filter(t => t.completed);
    const total = filteredTasks.length;
    const ratio = total > 0 ? (completed.length / total) : 0;
    
    const newInsights = [];
    
    if (filter === "Today") {
      if (total === 0) {
        newInsights.push({ text: "No operational nodes detected for today. Initialize tasks to begin analysis.", icon: <Zap size={14} className="text-gray-400" /> });
      } else if (ratio === 1) {
        newInsights.push({ text: "Operational perfection achieved. All today's tasks are synchronized.", icon: <Zap size={14} className="text-lime-500" /> });
      } else {
        newInsights.push({ text: `Current velocity: ${Math.round(ratio * 100)}%. ${total - completed.length} nodes pending sync.`, icon: <TrendingUp size={14} className="text-emerald-500" /> });
      }
    } else {
      if (ratio > 0.8) {
        newInsights.push({ text: "Peak efficiency detected. You are operating at 80%+ capacity.", icon: <Zap size={14} className="text-lime-500" /> });
      } else if (ratio > 0.5) {
        newInsights.push({ text: "Steady progress maintained. Focus on high-priority morning slots.", icon: <TrendingUp size={14} className="text-emerald-500" /> });
      } else {
        newInsights.push({ text: "System load optimization recommended to prevent fatigue.", icon: <AlertCircle size={14} className="text-rose-500" /> });
      }
    }

    const categories = [...new Set(filteredTasks.map(t => t.category || "General"))];
    if (categories.length > 1) {
      newInsights.push({ text: `Analysis covers ${categories.length} distinct operational sectors.`, icon: <Layout size={14} className="text-blue-500" /> });
    }

    return newInsights;
  }, [allTasks, filter]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          API.get("/intelligence/summary"),
          API.get("/tasks?limit=500")
        ]);
        setSummary(summaryRes.data);
        const tasks = tasksRes.data?.tasks || [];
        setAllTasks(tasks);
      } catch (error) {
        console.error("Analytics Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const filteredSummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filteredTasks = filter === "Today" 
      ? allTasks.filter(t => t.date && new Date(t.date).toISOString().split('T')[0] === todayStr)
      : allTasks;
    
    const completedCount = filteredTasks.filter(t => t.completed).length;
    const pendingCount = filteredTasks.filter(t => !t.completed && !t.overdue).length;
    const overdueCount = filteredTasks.filter(t => t.overdue).length;
    
    return { completed: completedCount, pending: pendingCount, overdue: overdueCount };
  }, [allTasks, filter]);

  const pieData = [
    { name: "Completed", value: filteredSummary.completed },
    { name: "Pending", value: filteredSummary.pending },
    { name: "Overdue", value: filteredSummary.overdue },
  ];

  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    
    const count = allTasks.filter(t => 
      t.completed && t.date && new Date(t.date).toISOString().split('T')[0] === dStr
    ).length;

    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      completed: count
    };
  });

  if (loading) return (
    <div className="min-h-screen pl-0 md:pl-20 p-4 md:p-8 lg:p-12 text-white flex flex-col gap-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl skeleton" />
        <div className="space-y-2">
          <div className="w-48 h-8 skeleton" />
          <div className="w-32 h-4 skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-4 sm:p-8 h-40 skeleton border-none" />)}
      </div>
      <div className="grid grid-cols-12 gap-8 h-[400px]">
        <div className="col-span-12 lg:col-span-8 skeleton rounded-3xl" />
        <div className="col-span-12 lg:col-span-4 skeleton rounded-3xl" />
      </div>
    </div>
  );

  const hasNoData = !summary || (summary.completed === 0 && summary.pending === 0 && summary.overdue === 0);


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
    <div className="min-h-screen pl-0 md:pl-20 p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-28 md:pb-10 page-transition">
      {/* Lighting FX */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between gap-4 mb-8 md:mb-16">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 sm:p-3.5 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl shrink-0">
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter truncate">Intelligence Overview</h1>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1 text-lime-500/60 font-black truncate">Operational Data Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl sm:p-1.5 sm:rounded-2xl border border-white/10 backdrop-blur-xl shrink-0">
          <FilterButton label="Today" active={filter === "Today"} onClick={() => setFilter("Today")} />
          <FilterButton label="Week" active={filter === "Week"} onClick={() => setFilter("Week")} />
          <FilterButton label="Month" active={filter === "Month"} onClick={() => setFilter("Month")} />
        </div>
      </header>

      {/* Top Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 md:mb-20 px-1 sm:px-2 lg:px-0">
        <StatCard 
          icon={CheckCircle2} 
          title="Completed Tasks" 
          value={filteredSummary.completed} 
          trend="12%" 
          trendUp={true}
          color="emerald"
        />
        <StatCard 
          icon={AlertCircle} 
          title="Missed Syncs" 
          value={filteredSummary.overdue} 
          trend="2%" 
          trendUp={false}
          color="rose"
        />
        <StatCard 
          icon={Clock} 
          title="Focus Time" 
          value={summary?.focusTime || "0h"} 
          trend="5.4%" 
          trendUp={true}
          color="blue"
        />
        <StatCard 
          icon={Zap} 
          title="Smart Score" 
          value={`${Math.round((filteredSummary.completed / Math.max(1, filteredSummary.completed + filteredSummary.pending + filteredSummary.overdue)) * 100)}%`} 
          trend="8.2%" 
          trendUp={true}
          color="lime"
        />
      </div>

      {/* Main Charts Grid */}
      {hasNoData ? (
        <div className="flex flex-col items-center justify-center text-center py-32 glass-card border-dashed">
          <div className="w-24 h-24 rounded-full bg-lime-500/10 flex items-center justify-center text-lime-500/40 mb-8 border border-lime-500/20 shadow-inner">
            <BarChart3 size={48} strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Intelligence analysis pending</h2>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-10">
            We need more operational data to generate your intelligence reports. 
            Complete your first few tasks to activate performance tracking.
          </p>
          <button 
            onClick={() => navigate('/tasks')}
            className="px-10 py-4 rounded-2xl bg-lime-500 text-white font-black text-sm uppercase tracking-wide shadow-2xl shadow-lime-500/20 hover:bg-lime-600 transition-all active:scale-95"
          >
            Access Task Interface
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 md:gap-12">
          
          {/* Productivity Velocity (Bar Chart) */}
           <div className="col-span-12 lg:col-span-8">
            <div className="glass-card p-4 sm:p-8 md:p-12 h-full chart-container overflow-hidden min-h-[300px] sm:min-h-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 shrink-0">
                    <BarChart3 size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight truncate">Performance Velocity</h3>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1">7-Day Completion Cycle</p>
                  </div>
                </div>
                <MoreHorizontal size={20} className="text-gray-700 cursor-pointer hover:text-white transition-colors shrink-0" />
              </div>

               <div className="w-full h-[220px] sm:h-[350px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                    />
                    <Bar dataKey="completed" fill="#84cc16" radius={[6, 6, 6, 6]} barSize={30} animationDuration={2000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Smart Score Ring (Circular Progress) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="glass-card p-6 sm:p-10 md:p-12 h-full chart-container flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-lime-500/10 transition-all" />
               
               <h3 className="text-lg md:text-xl font-black text-white tracking-tight mb-2 self-start">Smart Sync</h3>
               <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-6 sm:mb-8 md:mb-12 self-start">Cognitive Efficiency</p>
               
                <div className="relative w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 mb-6 sm:mb-8 md:mb-12">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" className="stroke-white/5 fill-none" strokeWidth="10" />
                    <motion.circle 
                      cx="50%" cy="50%" r="42%" 
                      className="stroke-lime-500 fill-none" 
                      strokeWidth="10" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 691" }}
                      animate={{ strokeDasharray: `${(parseInt(summary?.productivityScore || 78) / 100) * 691} 691` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{summary?.productivityScore || "78%"}</span>
                    <span className="text-xs font-black uppercase text-gray-500 tracking-wide mt-2">Efficiency</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1">Status</p>
                     <p className="text-sm font-black text-emerald-500 uppercase tracking-wide">Optimized</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                     <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1">Target</p>
                     <p className="text-sm font-black text-white tracking-wide">95%</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Productivity Trend (Line/Area Chart) */}
          <div className="col-span-12 lg:col-span-7">
            <div className="glass-card p-6 sm:p-8 md:p-10 lg:p-12 h-full chart-container">
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Activity Momentum</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-12">Cognitive Score Trend</p>
              
               <div className="w-full h-[200px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 900 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#84cc16" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights Summary */}
          <div className="col-span-12 lg:col-span-5">
            <div className="glass-card p-4 sm:p-8 md:p-10 h-full flex flex-col gap-6 md:gap-8 relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-lime-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-lime-500/10 transition-all" />
               
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500 shadow-lg shadow-lime-500/5">
                     <Brain size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white tracking-tight">AI Smart Insights</h3>
                     <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1">Deep Pattern Analysis</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {currentInsights.map((insight, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group/item">
                       <div className="shrink-0">{insight.icon}</div>
                       <p className="text-sm font-bold text-gray-400 group-hover/item:text-white transition-colors">{insight.text}</p>
                    </div>
                  ))}
               </div>

               <button 
                 onClick={() => navigate('/ai-assistant')}
                 className="mt-auto w-full py-4 rounded-[1.25rem] bg-lime-500/10 border border-lime-500/20 text-lime-500 font-black text-sm uppercase tracking-wide hover:bg-lime-500 hover:text-white transition-all ripple"
               >
                  Detailed Operational Report
               </button>
            </div>
          </div>

          {/* ── Task Explorer Section ─────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-6 md:gap-12">
          {/* Activity Momentum */}
          <div className="glass-card p-4 sm:p-8 relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Activity Momentum</h3>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide mt-1">7-Day Node Throughput</p>
              </div>
                <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl overflow-x-auto scrollbar-hide">
                  {["All", "Completed", "Pending", "Missed"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
                        (filter === cat || (filter === "Week" && cat === "All"))
                          ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/20' 
                          : 'bg-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {allTasks.filter(task => {
                  const now = new Date();
                  const [h, m] = (task.startTime || "00:00").split(':').map(Number);
                  const taskDate = new Date(task.date);
                  taskDate.setHours(h, m, 0, 0);
                  const expired = !task.completed && taskDate < now;

                  if (filter === "Completed") return task.completed;
                  if (filter === "Pending") return !task.completed && !expired;
                  if (filter === "Missed") return expired;
                  return true;
                }).length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 font-bold uppercase tracking-wide text-xs">No tasks matches this classification</p>
                  </div>
                ) : (
                  allTasks.filter(task => {
                    const now = new Date();
                    const [h, m] = (task.startTime || "00:00").split(':').map(Number);
                    const taskDate = new Date(task.date);
                    taskDate.setHours(h, m, 0, 0);
                    const expired = !task.completed && taskDate < now;

                    if (filter === "Completed") return task.completed;
                    if (filter === "Pending") return !task.completed && !expired;
                    if (filter === "Missed") return expired;
                    return true;
                  }).map((task) => {
                    const now = new Date();
                    const [h, m] = (task.startTime || "00:00").split(':').map(Number);
                    const taskDate = new Date(task.date);
                    taskDate.setHours(h, m, 0, 0);
                    const expired = !task.completed && taskDate < now;
                    
                    return (
                     <div key={task._id || task.id} className="p-3 sm:p-5 md:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group/item hover:bg-white/[0.06] transition-all">
                        <div className="flex items-center gap-3 md:gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                            task.completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            expired ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                            'bg-lime-500/10 border-lime-500/20 text-lime-500'
                          }`}>
                            {task.completed ? <CheckCircle2 size={18} /> : expired ? <AlertCircle size={18} /> : <Clock size={18} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white tracking-tight truncate">{task.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-black text-gray-500 uppercase tracking-wide">{task.category || "General"}</span>
                              <div className="w-1 h-1 rounded-full bg-gray-700" />
                              <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full border ${
                                task.priority === "High" ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                                task.priority === "Medium" ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" :
                                "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 mt-2 sm:mt-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                          <p className="text-xs font-black text-white">{formatTime12Hour(task.startTime)}</p>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">
                            {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Analytics;