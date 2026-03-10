import { useEffect, useState } from "react";
import { ChevronLeft, BrainCircuit, Activity, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Reports() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
    { name: "Completed", value: completed, color: "#34d399" }, // emerald-400
    { name: "Pending", value: pending, color: "#f87171" }, // red-400
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
        <div className={`lg:col-span-3 p-8 rounded-3xl backdrop-blur-md border shadow-2xl relative overflow-hidden transition-colors ${conditionBg}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -z-10"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className={`w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.2)]`}>
              {icon}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">Overall Condition</h2>
              <h3 className={`text-4xl md:text-5xl font-black tracking-tight mb-4 ${conditionColor} drop-shadow-md`}>
                {condition}
              </h3>
              <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">
                {message}
              </p>
            </div>

            {/* Efficiency Meter (Mini gauge fake) */}
            <div className="flex flex-col items-center justify-center bg-black/20 p-6 rounded-2xl border border-white/5 shadow-inner min-w-[160px]">
              <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="transparent" stroke={efficiency >= 80 ? "#34d399" : efficiency >= 50 ? "#22d3ee" : "#f87171"} strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * efficiency) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute text-2xl font-black text-white">{efficiency}%</span>
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Efficiency</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}

        {/* Task Distribution (Donut Chart) */}
        <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-white mb-6 w-full text-center">Task Distribution</h3>

          {total === 0 ? (
            <div className="h-48 flex items-center text-gray-500 font-medium">No tasks available</div>
          ) : (
            <div className="w-full h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{total}</span>
                <span className="text-xs text-gray-400 uppercase">Total</span>
              </div>
            </div>
          )}

          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-sm text-gray-300 font-medium">Completed ({completed})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span className="text-sm text-gray-300 font-medium">Pending ({pending})</span>
            </div>
          </div>
        </div>

        {/* Productivity Trends (Bar Chart) */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Productivity Trends (Tasks Completed)</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === barData.length - 1 ? '#8b5cf6' : '#6366f1'} />
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
