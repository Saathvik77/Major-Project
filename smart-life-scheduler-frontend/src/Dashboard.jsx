import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useContext } from "react";
import GlassCard from "./components/GlassCard";
import FloatingAICoach from "./components/FloatingAICoach";
import api from "./api";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Settings,
  Bot,
  Sparkles,
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
  Palette,
  Target,
  TrendingUp,
  Lightbulb,
  Timer,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";

// ── Stagger animation helpers ──────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const bannerVariants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ── Animated Progress Bar ─────────────────────────────────────────────────
function AnimatedProgressBar({ value }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-neonPrimary via-neonAccent to-neonSecondary shadow-[0_0_8px_rgba(124,108,255,0.6)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
      />
    </div>
  );
}

// ── Focus Timer Widget ───────────────────────────────────────────────────
function FocusTimerWidget() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            return 25 * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Circular ring */}
      <div className="relative w-20 h-20">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={213}
            strokeDashoffset={213 - (213 * progress) / 100}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C6CFF" />
              <stop offset="100%" stopColor="#FF7AF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-black text-white tabular-nums leading-none">{mins}:{secs}</span>
        </div>
      </div>
      <button
        onClick={() => setRunning((r) => !r)}
        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${running
          ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
          : "bg-neonPrimary/20 text-neonPrimary border border-neonPrimary/30 hover:bg-neonPrimary/30"
          }`}
      >
        {running ? "Pause" : "Start Focus"}
      </button>
    </div>
  );
}

// ── Streak Widget ─────────────────────────────────────────────────────────
function StreakWidget({ completedToday }) {
  const streak = completedToday > 0 ? Math.min(completedToday * 2, 14) : 0;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl leading-none drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]"
      >
        🔥
      </motion.div>
      <div className="text-center">
        <p className="text-2xl font-black text-white">{streak}</p>
        <p className="text-[10px] font-semibold text-orange-300 uppercase tracking-widest">Day Streak</p>
      </div>
    </div>
  );
}

// ── AI Insight Widget ─────────────────────────────────────────────────────
const aiInsights = [
  "🧠 Peak focus window: 9–11 AM. Schedule hard tasks now!",
  "💧 You're likely 20% dehydrated. Drink water!",
  "🎯 Breaking big tasks into 25-min chunks boosts output 40%.",
  "🌙 Sleep 7–8 hrs to consolidate today's learning.",
  "⚡ Short walk = +20% creativity. Take a 10-min break!",
];

function AIInsightWidget() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % aiInsights.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Lightbulb size={13} className="text-amber-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">AI Insight</span>
      </div>
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="text-xs font-semibold text-gray-200 leading-relaxed"
      >
        {aiInsights[idx]}
      </motion.p>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const { theme, setAppTheme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const prevCompletedRef = useRef(0);

  const [stats, setStats] = useState({
    todayCompleted: 0,
    todayTotal: 0,
  });

  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks?limit=500");
        const fetchedTasks = response.data.tasks || [];
        setTasks(fetchedTasks);

        const today = new Date().toDateString();
        const todayTasks = fetchedTasks.filter(
          (t) => t.date && new Date(t.date).toDateString() === today
        );
        const todayCompleted = todayTasks.filter((t) => t.completed).length;

        // 🎉 Confetti when new task is completed
        if (todayCompleted > prevCompletedRef.current) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#7C6CFF", "#00E5FF", "#FF7AF6", "#FFD166"],
          });
        }
        prevCompletedRef.current = todayCompleted;

        setStats({ todayCompleted, todayTotal: todayTasks.length });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch tasks dashboard stats", err);
        setError(err.response ? "Failed to load tasks." : "Network error: The backend server might be starting up. Please wait 30 seconds and refresh.");
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const fullName = res.data.user?.name || "User";
        setUserName(fullName.split(" ")[0]);
      } catch (err) {
        console.error("Failed to fetch profile info:", err);
      }
    };

    fetchProfile();
    fetchTasks();

    window.addEventListener("tasksUpdated", fetchTasks);

    const fetchWeather = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        if (data && data.current_weather) setWeatherData(data.current_weather);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(51.5074, -0.1278)
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
    { id: "auto", name: "Auto", icon: <Activity size={14} /> },
    { id: "default", name: "Dark", icon: <Moon size={14} /> },
    { id: "cyberpunk", name: "Cyber", icon: <Zap size={14} /> },
    { id: "ocean", name: "Ocean", icon: <Waves size={14} /> },
    { id: "sunset", name: "Sunset", icon: <Flame size={14} /> },
    { id: "neon", name: "Neon", icon: <Palette size={14} /> },
    { id: "light", name: "Light", icon: <Sun size={14} /> },
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

  const { suggestion: bannerSuggestion, weatherText } = getBannerSuggestionAndIcon();
  
  const todaysProductivityStr =
    stats.todayTotal > 0
      ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
      : 0;

  return (
    <div className="relative min-h-[calc(100vh-2rem)] flex flex-col items-center justify-between py-6 px-4 md:px-8 overflow-hidden font-sans bg-[#0a0a0c] text-white">
      {/* Cinematic Failsafe Background */}
      <div className="fixed inset-0 bg-[#0a0a0c] -z-20" />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />
      
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center gap-3 mb-8 px-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Bot size={22} fill="white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Smart Life Scheduler</h1>
      </motion.div>

      {/* ── Top Row: Greeting & Suggestion ─────────────────────────────── */}
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 mb-8 px-4">
        {/* Greeting Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col justify-between min-h-[140px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-white">{greeting}.</h2>
            <Sparkles className="text-amber-400" size={20} />
          </div>
          <div className="flex flex-wrap gap-3 mt-auto">
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 flex items-center gap-2">
               <Sun size={14} className="text-amber-400" />
               {weatherText}, {weatherData ? `${weatherData.temperature}°C` : "24°C"}
            </div>
            <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300">
               Today's productivity: <span className="text-white">{todaysProductivityStr}%</span>
            </div>
          </div>
        </motion.div>

        {/* AI Suggestion Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 flex flex-col justify-between min-h-[140px]"
        >
          <div className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 w-fit mb-4">
            AI Assistant Suggestion
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-gray-200 leading-relaxed">
              {bannerSuggestion}
            </p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles size={16} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Hero Area: 3D Illustration ────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex-1 flex items-center justify-center relative w-full h-[300px] md:h-auto min-h-[300px]"
      >
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/20 to-transparent blur-3xl rounded-full" />
        <img 
          src="https://img.freepik.com/free-vector/3d-isometric-time-management-concept-working-process_107791-16447.jpg" 
          alt="Dashboard Hero"
          className="relative z-10 max-h-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]"
        />
        {/* Soft floating particles */}
        <motion.div 
          animate={{ y: [0, -25, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute right-[25%] top-[20%] w-6 h-6 rounded-full bg-purple-400/30 blur-xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute left-[20%] bottom-[30%] w-10 h-10 rounded-full bg-cyan-400/20 blur-xl"
        />
      </motion.div>

      {/* ── Bottom Row: Navigation Cards ───────────────────────────────── */}
      <div className="w-full max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 px-4 relative z-20">
        <NavCard 
          icon={<ClipboardList className="text-purple-400" size={24} />}
          label="Tasks"
          bg="bg-purple-500/10"
          onClick={() => navigate("/tasks")}
        />
        <NavCard 
          icon={<Bot className="text-pink-400" size={24} />}
          label="AI Assistant"
          bg="bg-pink-500/10"
          onClick={() => navigate("/ai-assistant")}
        />
        <NavCard 
          icon={<BarChart3 className="text-cyan-400" size={24} />}
          label="Analytics"
          bg="bg-cyan-500/10"
          onClick={() => navigate("/analytics")}
        />
        <NavCard 
          icon={<HeartPulse className="text-amber-400" size={24} />}
          label="Health"
          bg="bg-amber-500/10"
          onClick={() => navigate("/health")}
        />
      </div>

      {/* ── AI Coach Floating Pill ─────────────────────────────────────── */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 glass-card px-4 py-2 flex items-center gap-2 cursor-pointer shadow-2xl group border-white/5"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Sparkles size={16} />
        </div>
        <span className="text-xs font-bold text-gray-300">AI Coach</span>
      </motion.div>

    </div>
  );
}

function NavCard({ icon, label, bg, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-6 flex flex-col items-center justify-center gap-4 cursor-pointer group"
    >
      <div className={`w-14 h-14 rounded-2xl ${bg} border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </motion.div>
  );
}

export default Dashboard;