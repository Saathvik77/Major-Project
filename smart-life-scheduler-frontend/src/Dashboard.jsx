import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import GlassCard from "./components/GlassCard";
import FloatingAICoach from "./components/FloatingAICoach";
import api from "./api";
import {
  Settings,
  Bot,
  ClipboardList,
  BarChart3,
  FileText,
  HeartPulse,
  Sun,
  CloudRain,
  Snowflake,
  CloudFog,
  Activity,
  Brain
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Stats derived from tasks
  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayTotal: 0,
  });

  useEffect(() => {
    // Fetch user tasks directly via API instead of passing them as props from context 
    // to keep it simple and consistent with other pages
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks?limit=500");
        const fetchedTasks = response.data.tasks || [];
        setTasks(fetchedTasks);

        // Calculate Today's Productivity stats specifically
        const today = new Date().toDateString();
        const todayTasks = fetchedTasks.filter(t => t.date && new Date(t.date).toDateString() === today);
        const todayCompleted = todayTasks.filter(t => t.completed).length;

        setStats({
          todayCompleted,
          todayTotal: todayTasks.length
        });
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tasks dashboard stats", err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    
    // Add event listener for tasksUpdated
    window.addEventListener("tasksUpdated", fetchTasks);
    
    // Fetch Weather for the Banner
    const fetchWeather = async (lat, lon) => {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();
            if (data && data.current_weather) setWeatherData(data.current_weather);
        } catch (err) {
            console.error("Failed to fetch weather", err);
        }
    };
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(51.5074, -0.1278) // fallback
        );
    }
    
    return () => window.removeEventListener("tasksUpdated", fetchTasks);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  };
  
  const greeting = getGreeting();
  const userName = "Pehlaj"; // Ideally fetched from profile, hardcoded per request mock

  const getBannerSuggestionAndIcon = () => {
    let suggestion = "Take a moment to plan your day!";
    let Icon = Sun;
    let weatherText = "Clear";
    
    if (weatherData) {
        const temp = weatherData.temperature;
        const code = weatherData.weathercode;
        
        if (code <= 2 && temp >= 10 && temp <= 32) {
            suggestion = "Perfect weather for a 30-minute cycling session! 🚲";
            Icon = Sun;
            weatherText = "Sunny";
        } else if (code >= 51) {
            suggestion = "It's wet outside. Time for a home HIIT session or hitting the indoor gym! 🌧️";
            Icon = CloudRain;
            weatherText = "Rainy";
        } else if (temp < 10 || (code >= 71 && code <= 77)) {
            suggestion = "Chilly outside. A warm indoor yoga session is highly recommended 🧘‍♂️";
            Icon = Snowflake;
            weatherText = "Cold";
        } else {
            suggestion = "Mild weather. A brisk 15-minute walk would be great for your health 🚶‍♂️";
            Icon = CloudFog;
            weatherText = "Mild";
        }
    }
    return { suggestion, Icon, weatherText };
  };

  const { suggestion: bannerSuggestion, Icon: WeatherIcon, weatherText } = getBannerSuggestionAndIcon();
  const todaysProductivityStr = stats.todayTotal > 0 ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;

  return (
    <div className="min-h-screen px-16 py-10 relative z-10 font-sans text-white">
      {/* Dynamic Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-4xl font-bold flex items-center gap-3 text-white tracking-tight">
          <ClipboardList size={40} className="text-primaryTeal drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
          Smart Life Scheduler
        </h1>

        <div className="relative group">
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-lg hover:bg-white/20 transition-all text-white font-medium">
            <Settings size={18} />
            Settings
          </button>

          <div className="absolute right-0 mt-3 w-40 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:scale-100 scale-95 overflow-hidden">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 SMART WELCOME BANNER */}
      <div className="mb-12 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-purple-600/20 border border-t-white/20 border-l-white/10 border-b-black/50 border-r-black/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl group">
         {/* Decorative Background Effects */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>

         <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-8">
            
            {/* Greeting & Quick Stats */}
            <div>
               <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-lg mb-4">
                   {greeting}, {userName} <span className="animate-wave inline-block origin-bottom-right">👋</span>
               </h1>
               
               <div className="flex flex-wrap items-center gap-6">
                   <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                       <WeatherIcon size={20} className="text-yellow-400" />
                       <span className="text-[15px] font-semibold text-gray-200">Weather: {weatherText} {weatherData ? `${weatherData.temperature}°C` : ''}</span>
                   </div>
                   
                   <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                       <Activity size={20} className="text-emerald-400" />
                       <span className="text-[15px] font-semibold text-gray-200">
                           Today's productivity: <span className="text-white font-black text-lg ml-1">{todaysProductivityStr}%</span>
                       </span>
                   </div>
               </div>
            </div>

            {/* Suggested Activity Box */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 md:min-w-[320px] shadow-xl flex-shrink-0 group-hover:bg-white-[0.15] transition-colors relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full my-4 mx-5 bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-pulse"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2 flex items-center gap-1.5 opacity-90">
                   <Brain size={14} /> AI Context Suggestion
                </p>
                <p className="text-[15px] font-bold text-white leading-relaxed pe-6">
                   {bannerSuggestion}
                </p>
            </div>

         </div>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-2 gap-20 items-center pb-20">
        {/* Left Cards */}
        <div className="grid grid-cols-2 gap-8">
          <Card
            icon={<ClipboardList size={50} className="text-primaryTeal drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]" />}
            title="Tasks"
            onClick={() => navigate("/tasks")}
          />

          <Card
            icon={<BarChart3 size={50} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" />}
            title="Analytics"
            onClick={() => navigate("/analytics")}
          />

          <Card
            icon={<FileText size={50} className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]" />}
            title="Reports"
            onClick={() => navigate("/reports")}
          />

          <Card
            icon={<HeartPulse size={50} className="text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]" />}
            title="Health"
            onClick={() => navigate("/health")}
          />
        </div>

        {/* Right Content */}
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-full scale-75"></div>
          {/* Decorative floating shapes */}
          <div className="relative w-80 h-80 rounded-full border-4 border-indigo-500/20 flex items-center justify-center animate-[spin_30s_linear_infinite]">
            <div className="absolute top-0 right-10 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-sm drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
            <div className="absolute bottom-10 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-sm drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
          </div>
        </div>
      </div>

      <FloatingAICoach weatherData={weatherData} tasks={tasks} stats={stats} />
    </div>
  );
}

function Card({ icon, title, onClick }) {
  return (
    <GlassCard
      onClick={onClick}
      className="p-8 flex flex-col items-center justify-center group overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-inner mb-6">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-100 text-center tracking-wide">
          {title}
        </h2>
      </div>
    </GlassCard>
  );
}

export default Dashboard;