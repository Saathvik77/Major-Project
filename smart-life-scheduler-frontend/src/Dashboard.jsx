import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useContext } from "react";
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
    <div className="min-h-screen px-16 py-10 relative z-10 font-sans text-white border-none">
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
      <div className="mb-12 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {greeting}, {userName} <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-300 font-medium">
            <span className="flex items-center gap-2">
              <WeatherIcon size={18} className="text-gray-400" />
              Weather: <strong className="text-white ml-1">{weatherText} {weatherData ? `${weatherData.temperature}°C` : ''}</strong>
            </span>
            <span className="hidden md:block text-gray-500">•</span>
            <span className="flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              Productivity: <strong className="text-white ml-1">{todaysProductivityStr}%</strong>
            </span>
          </div>

          <div className="mt-2 bg-slate-900/40 border border-white/5 rounded-xl px-5 py-3 max-w-xl flex items-start gap-3">
            <Brain size={18} className="text-neonPrimary shrink-0 mt-0.5" />
            <p className="text-[15px] font-medium text-gray-200 leading-relaxed">
              {bannerSuggestion}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-2 gap-20 items-center justify-items-stretch pb-20">
        {/* Left Cards */}
        <div className="flex flex-col gap-4 w-full">
          <CompactCard
            icon={<ClipboardList size={24} className="text-neonPrimary drop-shadow-[0_0_12px_rgba(124,108,255,0.8)]" />}
            title="Tasks"
            value={`${stats.todayTotal - stats.todayCompleted} remaining`}
            onClick={() => navigate("/tasks")}
          />

          <CompactCard
            icon={<BarChart3 size={24} className="text-neonSecondary drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]" />}
            title="Analytics"
            value={`${todaysProductivityStr}%`}
            onClick={() => navigate("/analytics")}
          />

          <CompactCard
            icon={<FileText size={24} className="text-neonAccent drop-shadow-[0_0_12px_rgba(255,122,246,0.8)]" />}
            title="Reports"
            value="View Insights"
            onClick={() => navigate("/reports")}
          />

          <CompactCard
            icon={<HeartPulse size={24} className="text-neonHighlight drop-shadow-[0_0_12px_rgba(255,209,102,0.8)]" />}
            title="Health"
            value="Good"
            onClick={() => navigate("/health")}
          />
        </div>

        {/* Right Content */}
        <div className="flex justify-center relative pointer-events-none w-full">
          {/* Decorative shapes with subtle glow */}
          <div className="relative w-[320px] h-[320px] rounded-full border border-white/20 flex items-center justify-center animate-[spin_40s_linear_infinite] shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <div className="absolute top-0 right-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_20px_rgba(0,229,255,0.4)]"></div>
            <div className="absolute bottom-10 left-0 w-16 h-16 bg-white/5 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_20px_rgba(124,108,255,0.4)]"></div>
          </div>
        </div>
      </div>

      <FloatingAICoach weatherData={weatherData} tasks={tasks} stats={stats} userName={userName} />
    </div>
  );
}

function CompactCard({ icon, title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-6 py-5 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-[1.25rem] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
          {icon}
        </div>
        <span className="text-[17px] font-bold text-gray-200 tracking-wide">{title}</span>
      </div>
      <span className="text-[15px] font-bold text-gray-400">{value}</span>
    </div>
  );
}

export default Dashboard;