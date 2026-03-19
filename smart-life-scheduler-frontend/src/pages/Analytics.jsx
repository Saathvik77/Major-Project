import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import API from "../api";
import { 
  ChevronLeft, Droplets, Dumbbell, Brain, Zap, Trophy, Target, Award, 
  MessageSquare, AlertCircle, HeartPulse, CheckCircle2, Bot, TrendingUp,
  Activity, BarChart3, Search, Calendar, Layout, MoreHorizontal
} from "lucide-react";
import { ThemeContext } from "../ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";

// ── Custom 3D Bar Shape ──────────────────────────────────────────────────
const Custom3DBar = (props) => {
  const { fill, x, y, width, height } = props;
  if (!height) return null;

  const depth = 8;
  return (
    <g>
      <path
        d={`M${x},${y} L${x + depth},${y - depth} L${x + width + depth},${y - depth} L${x + width},${y} Z`}
        fill={fill}
        filter="brightness(1.2)"
        opacity={0.9}
      />
      <path
        d={`M${x + width},${y} L${x + width + depth},${y - depth} L${x + width + depth},${y + height - depth} L${x + width},${y + height} Z`}
        fill={fill}
        filter="brightness(0.8)"
        opacity={0.9}
      />
      <rect x={x} y={y} width={width} height={height} fill={fill} opacity={0.9} />
    </g>
  );
};

function Analytics() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Theme Colors
  const COLORS = ["#f59e0b", "#3b82f6", "#ef4444"]; // Amber, Blue, Red

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [
          summaryRes,
          historyRes,
          tasksRes,
          profileRes
        ] = await Promise.all([
          API.get("/intelligence/summary"),
          API.get("/intelligence/history"),
          API.get("/tasks?limit=500"),
          API.get("/auth/profile")
        ]);

        setSummary(summaryRes.data);
        setHistory(historyRes.data);
        if (profileRes.data?.user) setUserProfile(profileRes.data.user);
        if (tasksRes.data?.tasks) {
          setCompletedTasks(tasksRes.data.tasks.filter(t => t.completed));
        }
      } catch (error) {
        console.error("Analytics Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pl-[84px]">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  const chartData = [
    { name: "Completed", value: summary?.completed || 0 },
    { name: "Pending", value: summary?.pending || 0 },
    { name: "Overdue", value: summary?.overdue || 0 },
  ];

  const historyChartData = [...history]
    .reverse()
    .map((item) => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      productivity: item.productivityScore,
      health: item.healthScore || 70,
    }));

  const userWeight = userProfile?.weight || 0;
  const waterTarget = userWeight ? (userWeight * 0.033).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-transparent pl-[84px] text-white page-transition">
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 relative z-10 w-full flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Channel Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Search size={20} />
             </div>
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <BarChart3 size={22} />
             </div>
          </div>
        </header>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Tasks", value: summary?.totalTasks || 0, color: "text-white" },
            { label: "Completed", value: summary?.completed || 0, color: "text-emerald-400" },
            { label: "Pending", value: summary?.pending || 0, color: "text-amber-400" },
            { label: "Overdue", value: summary?.overdue || 0, color: "text-rose-500" },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="glass-card p-6 flex flex-col gap-2 group hover:bg-white/[0.04] transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400">{stat.label}</span>
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
              <div className="w-12 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-current opacity-20 w-1/2" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Productivity Trend */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-8 min-h-[450px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Performance Growth</h3>
                    <p className="text-xs text-gray-500 font-medium">Weekly productivity & health metrics</p>
                  </div>
                </div>
                <MoreHorizontal size={20} className="text-gray-600" />
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData}>
                    <defs>
                      <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="productivity" 
                      stroke="#f59e0b" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="health" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health & Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-blue-500/20 bg-blue-500/[0.03]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                    <Droplets size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-300">Daily Hydration</h4>
                    <p className="text-2xl font-black">{waterTarget || "75"} <span className="text-xs font-bold text-gray-500">Liters</span></p>
                  </div>
                </div>
                <p className="text-xs text-analytics-dim leading-relaxed font-medium mt-2">
                  Maintain your energy levels! Based on your profile, this is your optimized water intake target for peak cognitive performance.
                </p>
              </div>

              <div className="glass-card p-6 border-orange-500/20 bg-orange-500/[0.03]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-500/10">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-orange-300">Activity Pulse</h4>
                    <p className="text-xl font-black">HIIT Session</p>
                  </div>
                </div>
                <p className="text-xs text-analytics-dim leading-relaxed font-medium mt-2">
                  Afternoon is your peak physical strength window. A 20-min HIIT session will boost your dopamine and reset your focus.
                </p>
              </div>
            </div>
          </div>

          {/* Side Panel: Insights & Distribution */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Task Distribution */}
            <div className="glass-card p-8 flex flex-col items-center">
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8 self-start">Task Distribution</h3>
               <div className="w-full h-[240px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex gap-4 mt-4 w-full justify-center">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <span className="text-[10px] font-black uppercase text-gray-500">{d.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* AI Insights Card */}
            <div className="glass-card p-6 border-amber-500/20 bg-amber-500/[0.03]">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                    <Bot size={20} />
                  </div>
                  <h3 className="text-sm font-bold tracking-widest uppercase">Coach Analysis</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                     <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase text-amber-500/80">Productivity Peak</span>
                     </div>
                     <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        Your efficiency spikes between 10 AM and 1 PM. Schedule your high-complexity tasks here.
                     </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                     <div className="flex items-center gap-2 mb-1">
                        <HeartPulse size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase text-blue-500/80">Wellness Score</span>
                     </div>
                     <p className="text-xs text-gray-300 font-medium leading-relaxed">
                        Consistency is key! Your 3-day streak is boosting your baseline cognitive focus by 12%.
                     </p>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* History Log */}
        <div className="glass-card p-8">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Activity Log</h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                 Last 30 Days <Calendar size={14} />
              </div>
           </div>
           
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {completedTasks.length > 0 ? (
                completedTasks.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={18} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{t.title}</h4>
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/10">Done</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-40">
                   <p className="text-sm font-medium">No activity recorded for this period.</p>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
