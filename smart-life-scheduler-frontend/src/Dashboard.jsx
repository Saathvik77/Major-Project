import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useContext } from "react";
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
  Brain,
  User,
  LogOut,
  Moon
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // Stats derived from tasks
  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayTotal: 0,
  });

  const [userName, setUserName] = useState("");

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

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        // Get first name or default to User
        const fullName = res.data.user?.name || "User";
        setUserName(fullName.split(" ")[0]);
      } catch (err) {
        console.error("Failed to fetch profile info:", err);
      }
    };

    fetchProfile();
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
      <div className="flex justify-between items-center mb-16 relative z-50">
        <h1 className="text-4xl font-extrabold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 tracking-tight drop-shadow-md">
          <ClipboardList size={40} className="text-teal-400 drop-shadow-[0_0_20px_rgba(45,212,191,0.8)]" />
          Smart Life Scheduler
        </h1>

        <div className="relative group">
          <button className="flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(255,255,255,0.15)] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 text-white font-medium">
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            Settings
          </button>

          <div className="absolute right-0 mt-3 w-48 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 group-hover:scale-100 scale-95 overflow-hidden z-50">
            <div className="p-2 space-y-1">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30 hover:text-indigo-200 transition-all duration-300 text-gray-200 font-medium group/btn"
              >
                <User className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300 text-indigo-400" />
                Profile
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-500/30 hover:to-orange-500/30 hover:text-amber-200 transition-all duration-300 text-gray-200 font-medium group/btn"
              >
                {isLightMode ? (
                  <>
                    <Moon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300 text-slate-400" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300 text-amber-400" />
                    Light Mode
                  </>
                )}
              </button>

              <div className="h-px w-full bg-white/5 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-500/30 hover:to-orange-500/30 hover:text-red-200 transition-all duration-300 text-gray-200 font-medium group/btn"
              >
                <LogOut className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300 text-red-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 SMART WELCOME BANNER */}
      <div className="mb-12 bg-gradient-to-r from-neonPrimary/30 via-neonAccent/20 to-neonSecondary/30 border border-t-neonSecondary/30 border-l-neonPrimary/30 border-b-black/50 border-r-black/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-3xl p-8 relative overflow-hidden backdrop-blur-xl group hover:shadow-[0_8px_40px_rgba(124,108,255,0.3)] transition-all duration-500">
        {/* Decorative Background Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neonAccent/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neonSecondary/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-8">

          {/* Greeting & Quick Stats */}
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonPrimary via-neonAccent to-neonSecondary drop-shadow-sm tracking-tight flex items-center gap-3 mb-4">
              {greeting}, {userName} <span className="text-white animate-wave inline-block origin-bottom-right">👋</span>
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
          <div className="bg-white/10 border border-neonPrimary/30 rounded-2xl p-5 md:min-w-[320px] shadow-xl flex-shrink-0 group-hover:bg-white-[0.15] transition-colors relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full my-4 mx-5 bg-neonHighlight shadow-[0_0_12px_rgba(255,209,102,0.8)] animate-pulse"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-neonPrimary mb-2 flex items-center gap-1.5 opacity-90">
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
            icon={<ClipboardList size={50} className="text-neonPrimary drop-shadow-[0_0_15px_rgba(124,108,255,0.6)]" />}
            title="Tasks"
            onClick={() => navigate("/tasks")}
          />

          <Card
            icon={<BarChart3 size={50} className="text-neonSecondary drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]" />}
            title="Analytics"
            onClick={() => navigate("/analytics")}
          />

          <Card
            icon={<FileText size={50} className="text-neonAccent drop-shadow-[0_0_15px_rgba(255,122,246,0.6)]" />}
            title="Reports"
            onClick={() => navigate("/reports")}
          />

          <Card
            icon={<HeartPulse size={50} className="text-neonHighlight drop-shadow-[0_0_15px_rgba(255,209,102,0.6)]" />}
            title="Health"
            onClick={() => navigate("/health")}
          />
        </div>

        {/* Right Content */}
        <div className="flex justify-center relative pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-neonPrimary/20 to-neonSecondary/20 blur-3xl rounded-full scale-75"></div>
          {/* Decorative floating shapes */}
          <div className="relative w-80 h-80 rounded-full border-4 border-neonAccent/20 flex items-center justify-center animate-[spin_30s_linear_infinite]">
            <div className="absolute top-0 right-10 w-16 h-16 bg-gradient-to-br from-neonSecondary to-neonPrimary rounded-full blur-sm drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]"></div>
            <div className="absolute bottom-10 left-0 w-24 h-24 bg-gradient-to-br from-neonPrimary to-neonAccent rounded-full blur-sm drop-shadow-[0_0_15px_rgba(124,108,255,0.8)]"></div>
          </div>
        </div>
      </div>

      <FloatingAICoach weatherData={weatherData} tasks={tasks} stats={stats} userName={userName} />
    </div>
  );
}

function Card({ icon, title, onClick }) {
  return (
    <GlassCard
      onClick={onClick}
      className="p-8 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:shadow-[0_0_30px_rgba(120,119,198,0.3)] transition-all duration-500 border border-white/10 hover:border-white/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Animated Background Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-400/20 transition-all duration-700"></div>

      <div className="relative z-10 transform group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-500 flex flex-col items-center">
        <div className="p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] mb-6 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:border-white/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {icon}
        </div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 group-hover:from-white group-hover:to-indigo-200 transition-all duration-500 text-center tracking-wide drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          {title}
        </h2>
      </div>
    </GlassCard>
  );
}

export default Dashboard;