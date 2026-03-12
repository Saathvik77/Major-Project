import { useEffect, useState, useContext } from "react";
import { ChevronLeft, BrainCircuit, Activity, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ThemeContext } from "../ThemeContext";
import Tilt from "react-parallax-tilt";

export default function Reports() {
  const navigate = useNavigate();
  const { theme, activeTheme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic theme colors for charts
  const [primaryColor, setPrimaryColor] = useState("#7C6CFF");
  const [secondaryColor, setSecondaryColor] = useState("#00E5FF");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks?limit=50");
        setTasks(res.data.tasks || []);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Update chart colors whenever the theme changes
  useEffect(() => {
    const root = document.documentElement;
    const computedStyles = getComputedStyle(root);

    // Tiny timeout ensures custom properties are applied first
    setTimeout(() => {
      const primary = computedStyles.getPropertyValue('--primary').trim() || "#7C6CFF";
      const secondary = computedStyles.getPropertyValue('--secondary').trim() || "#00E5FF";
      setPrimaryColor(primary);
      setSecondaryColor(secondary);
    }, 50);
  }, [theme, activeTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse">Analyzing user condition...</p>
      </div>
    );
  }

  // Calculate generic health metrics based on task ratio
  const completed = tasks.filter((t) => t.completed === true).length;
  const pending = tasks.filter((t) => t.completed === false).length;
  const total = tasks.length;

  let condition = "Neutral";
  let conditionColor = "text-gray-400";
  let conditionBg = "bg-gray-500/10 border-gray-500/20";
  let message = "Not enough data to determine your state. Keep adding tasks!";
  let icon = <BrainCircuit size={48} className="text-gray-400" />;

  let efficiency = 0;

  if (total > 0) {
    efficiency = Math.round((completed / total) * 100);
    const completionRate = completed / total;

    if (completionRate >= 0.8) {
      condition = "Excellent";
      conditionColor = "text-emerald-400";
      conditionBg = "bg-emerald-500/10 border-emerald-500/30";
      message = "You are operating at peak efficiency! Your task completion rate is outstanding.";
      icon = <Activity size={48} className="text-emerald-400" />;
    } else if (completionRate >= 0.5) {
      condition = "Stable";
      conditionColor = "text-cyan-400";
      conditionBg = "bg-cyan-500/10 border-cyan-500/30";
      message = "You are maintaining a steady pace. There's room to optimize your workflow.";
      icon = <HeartPulse size={48} className="text-cyan-400" />;
    } else {
      condition = "Overwhelmed";
      conditionColor = "text-red-400";
      conditionBg = "bg-red-500/10 border-red-500/30";
      message = "You have a large backlog of pending tasks. Try breaking tasks into smaller chunks.";
      icon = <BrainCircuit size={48} className="text-red-400" />;
    }
  }

  const pieData = [
    { name: "Completed", value: completed, color: primaryColor },
    { name: "Pending", value: pending, color: secondaryColor },
  ];

  // Mocked historical data for bar chart since backend only provides current tasks right now
  const barData = [
    { name: "Mon", tasks: Math.max(0, completed - 2) },
    { name: "Tue", tasks: Math.max(0, completed - 1) },
    { name: "Wed", tasks: completed + 1 },
    { name: "Thu", tasks: completed + 2 },
    { name: "Fri", tasks: completed },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-gray-200 font-semibold">{`${payload[0].name} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen px-6 py-8 relative z-10 font-sans text-white max-w-5xl mx-auto">
      {/* Dynamic Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>

      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Health & Reports</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Status Card */}
        <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} glareEnable={true} glareMaxOpacity={0.05} className="lg:col-span-3">
          <div className={`p-8 rounded-3xl backdrop-blur-md border shadow-2xl relative overflow-hidden transition-colors w-full h-full ${conditionBg}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -z-10"></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className={`w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.2)]`}>
                {icon}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white/50 uppercase tracking-[0.2em] mb-2 text-sm">Vital Status</h2>
                <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                  <h3 className={`text-5xl font-black tracking-tight ${conditionColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>{condition}</h3>
                  {condition === "Excellent" && <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-bold shadow-lg animate-pulse">PRIME</div>}
                </div>
                <p className="text-gray-300 font-medium text-lg leading-relaxed max-w-lg">{message}</p>
              </div>

              {/* Efficiency Meter */}
              <div className="relative w-32 h-32 flex-shrink-0 hidden md:flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-white/10 fill-none" strokeWidth="12" />
                  <circle cx="64" cy="64" r="56" className={`fill-none transition-all duration-1000 ease-out`} strokeWidth="12" strokeDasharray={`${efficiency * 3.51} 351`} strokeLinecap="round" stroke={condition === "Excellent" ? "#34d399" : condition === "Stable" ? "#22d3ee" : "#f87171"} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{efficiency}%</span>
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </Tilt>

        {/* Task Distribution (Donut Chart) */}
        <div className="lg:col-span-1 p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <h2 className="text-lg font-bold text-gray-200 uppercase tracking-wider mb-6">Task Load Distribution</h2>
          <div className="h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white drop-shadow-md">{total}</span>
              <span className="text-xs font-bold uppercase text-gray-400 tracking-widest mt-1">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor, boxShadow: `0_0_8px ${primaryColor}` }}></div>
              <span className="text-sm font-semibold text-gray-300">Completed ({completed})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor, boxShadow: `0_0_8px ${secondaryColor}` }}></div>
              <span className="text-sm font-semibold text-gray-300">Pending ({pending})</span>
            </div>
          </div>
        </div>

        {/* Historical Productivity (Bar Chart) */}
        <div className="lg:col-span-2 p-7 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-200 uppercase tracking-wider">Productivity Trend</h2>
            <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full text-indigo-300 tracking-widest uppercase">Last 5 Days</span>
          </div>

          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                {/* Dynamically reading the primary theme color from the document root */}
                <Bar
                  dataKey="tasks"
                  fill="var(--primary, #00E5FF)"
                  radius={[8, 8, 8, 8]}
                  barSize={40}
                  animationDuration={1500}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity" style={{ filter: `drop-shadow(0px 0px 10px var(--primary))` }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
