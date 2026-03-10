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
  Moon,
  Zap,
  Waves,
  Flame,
  Palette
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { theme, setAppTheme } = useContext(ThemeContext);
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

  const themes = [
    { id: 'auto', name: 'Auto', icon: <Activity size={14} /> },
    { id: 'default', name: 'Dark', icon: <Moon size={14} /> },
    { id: 'cyberpunk', name: 'Cyber', icon: <Zap size={14} /> },
    { id: 'ocean', name: 'Ocean', icon: <Waves size={14} /> },
    { id: 'sunset', name: 'Sunset', icon: <Flame size={14} /> },
    { id: 'neon', name: 'Neon', icon: <Palette size={14} /> },
    { id: 'light', name: 'Light', icon: <Sun size={14} /> }
  ];

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
    <div className="min-h-screen px-6 py-6 md:px-16 md:py-10 relative z-10 font-sans text-white border-none overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 md:mb-16 relative z-50">
        <h1 className="text-2xl md:text-4xl font-extrabold flex items-center gap-2 md:gap-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 tracking-tight drop-shadow-md">
          <ClipboardList className="text-teal-400 drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] w-8 h-8 md:w-10 md:h-10" />
          Smart Life Scheduler
        </h1>

        <div className="relative group shrink-0">
          <button className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20 px-4 py-2 md:px-6 md:py-2.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(255,255,255,0.15)] hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 text-white font-medium text-sm md:text-base">
            <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <div className="absolute right-0 mt-3 w-64 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 group-hover:scale-100 scale-95 overflow-hidden z-[100]">
            <div className="p-3 space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-500/30 hover:to-purple-500/30 hover:text-indigo-200 transition-all duration-300 text-gray-200 font-medium group/btn"
              >
                <User className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300 text-indigo-400" />
                Profile
              </button>

              <div className="px-2 pt-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 mb-2">
                  <Palette size={12} className="text-neonPrimary" />
                  App Theme
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAppTheme(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${theme === t.id
                        ? 'bg-neonPrimary/20 border-neonPrimary text-white shadow-[0_0_10px_rgba(124,108,255,0.3)]'
                        : 'bg-slate-900/60 border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                    >
                      <div className={theme === t.id ? 'text-neonPrimary' : 'text-gray-500'}>
                        {t.icon}
                      </div>
                      <span className="text-[11px] font-bold tracking-wide">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-white/5 my-2"></div>
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
      <div className="mb-8 md:mb-12 bg-slate-900/40 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl group transition-all duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-6 md:gap-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonPrimary via-neonAccent to-neonSecondary drop-shadow-sm tracking-tight flex items-center gap-3 mb-4">
              {greeting}, {userName} <span className="text-white animate-wave inline-block origin-bottom-right">👋</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                <WeatherIcon className="text-yellow-400 w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                <span className="text-sm md:text-[15px] font-semibold text-gray-200">Weather: {weatherText} {weatherData ? `${weatherData.temperature}°C` : ''}</span>
              </div>

              <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                <Activity className="text-emerald-400 w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                <span className="text-sm md:text-[15px] font-semibold text-gray-200">
                  Today's productivity: <span className="text-white font-black text-base md:text-lg ml-1">{todaysProductivityStr}%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-neonPrimary/30 rounded-2xl p-4 md:p-5 w-full md:w-auto md:min-w-[320px] shadow-xl flex-shrink-0 group-hover:bg-white/[0.15] transition-colors relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full my-4 mx-5 bg-neonHighlight shadow-[0_0_12px_rgba(255,209,102,0.8)] animate-pulse"></div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neonPrimary mb-2 flex items-center gap-1.5 opacity-90">
              <Brain size={14} /> AI Context Suggestion
            </p>
            <p className="text-sm md:text-[15px] font-bold text-white leading-relaxed pe-6">
              {bannerSuggestion}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-20 items-center justify-items-stretch pb-24 md:pb-20">
        {/* Left Cards */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full">
          <Card
            icon={<ClipboardList size={40} className="text-neonPrimary drop-shadow-[0_0_15px_rgba(124,108,255,0.6)] md:w-[50px] md:h-[50px]" />}
            title="Tasks"
            onClick={() => navigate("/tasks")}
          />

          <Card
            icon={<BarChart3 size={40} className="text-neonSecondary drop-shadow-[0_0_15px_rgba(0,229,255,0.6)] md:w-[50px] md:h-[50px]" />}
            title="Analytics"
            onClick={() => navigate("/analytics")}
          />

          <Card
            icon={<FileText size={40} className="text-neonAccent drop-shadow-[0_0_15px_rgba(255,122,246,0.6)] md:w-[50px] md:h-[50px]" />}
            title="Reports"
            onClick={() => navigate("/reports")}
          />

          <Card
            icon={<HeartPulse size={40} className="text-neonHighlight drop-shadow-[0_0_15px_rgba(255,209,102,0.6)] md:w-[50px] md:h-[50px]" />}
            title="Health"
            onClick={() => navigate("/health")}
          />
        </div>

        {/* Right Content */}
        <div className="hidden md:flex justify-center relative pointer-events-none w-full">
          <div className="absolute inset-0 bg-transparent blur-3xl rounded-full scale-75"></div>
          {/* Decorative floating shapes with internal glow, subtle outer ring */}
          <div className="relative w-80 h-80 rounded-full border border-white/10 flex items-center justify-center animate-[spin_30s_linear_infinite]">
            <div className="absolute top-0 right-10 w-16 h-16 bg-gradient-to-br from-neonSecondary to-neonPrimary rounded-full blur-sm shadow-[0_0_15px_rgba(0,229,255,0.4)]"></div>
            <div className="absolute bottom-10 left-0 w-24 h-24 bg-gradient-to-br from-neonPrimary to-neonAccent rounded-full blur-sm shadow-[0_0_15px_rgba(124,108,255,0.4)]"></div>
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
      className="p-6 md:p-8 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer hover:shadow-[0_0_30px_rgba(120,119,198,0.3)] transition-all duration-500 border border-white/10 hover:border-white/30 h-full min-h-[140px] md:min-h-[180px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Animated Background Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-400/20 transition-all duration-700"></div>

      <div className="relative z-10 transform group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-500 flex flex-col items-center">
        <div className="p-4 md:p-5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] mb-4 md:mb-6 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:border-white/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {icon}
        </div>
        <h2 className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 group-hover:from-white group-hover:to-indigo-200 transition-all duration-500 text-center tracking-wide drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          {title}
        </h2>
      </div>
    </GlassCard>
  );
}

export default Dashboard;