import { useEffect, useState, useContext, useMemo } from "react";
import { ChevronLeft, BrainCircuit, Activity, HeartPulse, Cloud, Sun, CloudRain, CloudLightning, Wind, Thermometer, MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ThemeContext } from "../ThemeContext";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

// ─── Weather Component ───────────────────────────────────────────────
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("Detecting...");
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState("Analyzing environment for optimal activities...");

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const data = await res.json();
        setWeather(data);
        
        // Reverse geocoding to get city name
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const geoData = await geoRes.json();
        setLocation(geoData.address.city || geoData.address.town || geoData.address.village || "Unknown Location");

        // Generate AI suggestion based on weather code
        generateAiSuggestion(data.current_weather.weathercode, data.current_weather.temperature);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const generateAiSuggestion = (code, temp) => {
      let suggestion = "";
      if (code <= 1) { // Clear
        suggestion = temp > 25 
          ? "Perfect clear skies. Ideal for outdoor cardio or a scenic walk. Stay hydrated!" 
          : "Crisp clear day. Great for an outdoor session or refreshing your workspace with natural light.";
      } else if (code <= 3) { // Cloudy
        suggestion = "Overcast conditions detected. Optimal for high-focus deep work or indoor strength training.";
      } else if (code <= 67) { // Rain
        suggestion = "Precipitation active. Perfect time for indoor planning, reading, or catching up on administrative tasks.";
      } else if (code <= 99) { // Storm
        suggestion = "Severe weather. Stay indoors. Focus on low-energy recovery tasks or creative brainstorming.";
      } else {
        suggestion = "Maintain steady productivity. Adapt your flow to the current environment.";
      }
      setAiSuggestion(suggestion);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          fetchWeather(40.7128, -74.0060); // New York
          setLocation("New York (Default)");
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const getWeatherIcon = (code) => {
    if (code <= 1) return <Sun className="text-yellow-400" size={32} />;
    if (code <= 3) return <Cloud className="text-gray-400" size={32} />;
    if (code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code <= 99) return <CloudLightning className="text-purple-400" size={32} />;
    return <Sun className="text-yellow-400" size={32} />;
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-lime-500 mb-1">
            <MapPin size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{location}</span>
          </div>
          <h3 className="text-2xl font-black text-white leading-none">
            {weather?.current_weather?.temperature}°C
          </h3>
        </div>
        {getWeatherIcon(weather?.current_weather?.weathercode)}
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-lime-500/5 border border-lime-500/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-lime-500" />
          <span className="text-[9px] font-black text-lime-500 uppercase tracking-widest">AI Activity Suggestion</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed italic">
          "{aiSuggestion}"
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mt-4">
        {weather?.daily?.time.slice(1, 5).map((time, i) => (
          <div key={time} className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase mb-1">
              {new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            {getWeatherIcon(weather?.daily?.weathercode[i+1])}
            <span className="text-[10px] font-bold text-white mt-1">
              {Math.round(weather?.daily?.temperature_2m_max[i+1])}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heat Map Component ─────────────────────────────────────────────
function ActivityHeatMap({ tasks }) {
  const days = 70; // Last 10 weeks
  const data = useMemo(() => {
    const map = {};
    const today = new Date();
    
    // Fill with tasks
    tasks.forEach(t => {
      const d = new Date(t.date).toISOString().split('T')[0];
      map[d] = (map[d] || 0) + (t.completed ? 1 : 0);
    });

    const result = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      result.push({ date: dStr, count: map[dStr] || 0 });
    }
    return result;
  }, [tasks]);

  const getColor = (count) => {
    if (count === 0) return "bg-white/[0.03] border-white/5";
    if (count === 1) return "bg-lime-900/40 border-lime-500/20";
    if (count === 2) return "bg-lime-700/60 border-lime-500/40";
    if (count >= 3) return "bg-lime-500 border-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.4)]";
    return "bg-white/[0.03]";
  };

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className="flex gap-1.5 min-w-max">
        {Array.from({ length: Math.ceil(data.length / 7) }).map((_, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-1.5">
            {data.slice(colIdx * 7, colIdx * 7 + 7).map((day, i) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} tasks`}
                className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-500 ${getColor(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 px-1">
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">10 Weeks Ago</span>
        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Today</span>
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const { theme, activeTheme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic theme colors for charts
  const [primaryColor, setPrimaryColor] = useState("#84cc16");
  const [secondaryColor, setSecondaryColor] = useState("rgba(132, 204, 22, 0.2)");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks?limit=100");
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
      const primary = computedStyles.getPropertyValue('--accent').trim() || "#84cc16";
      setPrimaryColor(primary);
    }, 50);
  }, [theme, activeTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-transparent pl-0 md:pl-[84px] p-4 md:p-8 lg:p-12">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-lime-500/20 border-t-lime-500 rounded-full animate-spin" />
           <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-500/50">Synchronizing Intelligence...</p>
        </div>
      </div>
    );
  }

  // Calculate generic health metrics based on task ratio
  const completed = tasks.filter((t) => t.completed === true).length;
  const pending = tasks.filter((t) => t.completed === false).length;
  const total = tasks.length;

  let condition = "Neutral";
  let conditionColor = "text-lime-400";
  let conditionBg = "bg-lime-500/5 border-lime-500/20";
  let message = "Intelligence gathering in progress. Keep optimizing your schedule!";
  let icon = <BrainCircuit size={48} className="text-lime-400" />;

  let efficiency = 0;

  if (total > 0) {
    efficiency = Math.round((completed / total) * 100);
    const completionRate = completed / total;

    if (completionRate >= 0.8) {
      condition = "Excellent";
      conditionColor = "text-lime-400";
      conditionBg = "bg-lime-500/10 border-lime-500/30 shadow-[inset_0_0_40px_rgba(132,204,22,0.05)]";
      message = "You are operating at peak efficiency! Your focus remains unmatched.";
      icon = <Activity size={48} className="text-lime-400" />;
    } else if (completionRate >= 0.5) {
      condition = "Stable";
      conditionColor = "text-lime-400";
      conditionBg = "bg-lime-500/5 border-lime-500/20";
      message = "Your productivity is consistent. Strategic adjustments could boost performance.";
      icon = <HeartPulse size={48} className="text-lime-400" />;
    } else {
      condition = "Overloaded";
      conditionColor = "text-rose-400";
      conditionBg = "bg-rose-500/5 border-rose-500/20";
      message = "Cognitive load is high. We recommend offloading or rescheduling low-priority tasks.";
      icon = <BrainCircuit size={48} className="text-rose-400" />;
    }
  }

  const pieData = [
    { name: "Completed", value: completed, color: "#84cc16" },
    { name: "Pending", value: pending, color: "rgba(255,255,255,0.05)" },
  ];

  // Mocked historical data for bar chart
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
        <div className="bg-[#0f1115] border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{payload[0].name}</p>
          <p className="text-white font-black text-xl">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-32 page-transition">
      {/* ── Premium Lighting FX ────────────────────────────────────── */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-lime-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-lime-700/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10 md:mb-12">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">System Reports</h1>
            <p className="text-[10px] font-black text-lime-500 uppercase tracking-[0.3em] mt-1">Operational Performance Analysis</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 md:gap-10">

        {/* ── Top Row: Status & Weather ─────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8">
          <Tilt tiltMaxAngleX={2} tiltMaxAngleY={2} glareEnable={true} glareMaxOpacity={0.03} className="h-full">
            <div className={`p-6 sm:p-10 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl border shadow-2xl relative overflow-hidden transition-all h-full flex flex-col justify-center ${conditionBg}`}>
              {/* Internal Glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/5 rounded-full blur-[100px] -z-10"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-lime-500/5 rounded-full blur-[60px] -z-10"></div>

              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 relative z-10">
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-2xl relative group`}>
                  <div className="absolute inset-0 bg-lime-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  {icon}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                    <Sparkles size={14} className="text-lime-500" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Operational Readiness</span>
                  </div>
                  <div className="flex items-center gap-4 justify-center md:justify-start mb-5">
                    <h3 className={`text-5xl md:text-6xl font-black tracking-tighter ${conditionColor}`}>{condition}</h3>
                    {condition === "Excellent" && (
                      <div className="px-4 py-1.5 bg-lime-500 text-black text-[10px] font-black rounded-full shadow-[0_0_20px_rgba(132,204,22,0.4)] uppercase tracking-widest">
                        Peak
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 font-medium text-base md:text-lg leading-relaxed max-w-lg">{message}</p>
                </div>
              </div>
            </div>
          </Tilt>
        </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-radial-gradient from-lime-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Cloud size={14} className="text-lime-500" />
              Environment
            </h2>
            <WeatherWidget />
          </div>
        </div>

        {/* ── Middle Row: Heat Map ──────────────────────────────────── */}
        <div className="col-span-12">
          <div className="p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                   <h2 className="text-lg font-black text-white tracking-tight">Consistency Matrix</h2>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Daily task completion density</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold text-gray-600 uppercase">Less</span>
                      <div className="flex gap-1">
                         <div className="w-3 h-3 rounded-[2px] bg-white/[0.03] border border-white/5" />
                         <div className="w-3 h-3 rounded-[2px] bg-lime-900/40 border border-lime-500/20" />
                         <div className="w-3 h-3 rounded-[2px] bg-lime-500 border border-lime-400" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-600 uppercase">More</span>
                   </div>
                </div>
             </div>
             <ActivityHeatMap tasks={tasks} />
          </div>
        </div>

        {/* ── Bottom Row: Charts ────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group h-full">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8">Capacity Allocation</h2>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={105}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-white tracking-tighter">{total}</span>
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mt-1">Total Tasks</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
                  <span className="text-xs font-bold text-gray-300">Completed</span>
                </div>
                <span className="text-sm font-black text-white">{completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <span className="text-xs font-bold text-gray-300">Pending</span>
                </div>
                <span className="text-sm font-black text-white">{pending}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group h-full">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Productivity Velocity</h2>
              <div className="flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 px-3 py-1 rounded-full">
                <TrendingUp size={12} className="text-lime-500" />
                <span className="text-[9px] font-black text-lime-500 uppercase tracking-widest">Growth +12%</span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff20" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} dy={15} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff03' }} />
                  <Bar
                    dataKey="tasks"
                    fill="#84cc16"
                    radius={[12, 12, 12, 12]}
                    barSize={45}
                    animationDuration={1500}
                  >
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Missing Import Helper ───────────────────────────────────────────
function TrendingUp({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
