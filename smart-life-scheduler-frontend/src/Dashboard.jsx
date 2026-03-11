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
        className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all duration-300 ${
          running
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
        setError("Failed to load tasks.");
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

  const { suggestion: bannerSuggestion, Icon: WeatherIcon, weatherText } =
    getBannerSuggestionAndIcon();
  const todaysProductivityStr =
    stats.todayTotal > 0
      ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
      : 0;

  return (
    <div className="min-h-screen px-6 py-6 md:px-16 md:py-10 relative z-10 font-sans text-white border-none overflow-x-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-8 md:mb-16 relative z-50"
      >
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
                onClick={() => navigate("/profile")}
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border ${
                        theme === t.id
                          ? "bg-neonPrimary/20 border-neonPrimary text-white shadow-[0_0_10px_rgba(124,108,255,0.3)]"
                          : "bg-slate-900/60 border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      }`}
                    >
                      <div className={theme === t.id ? "text-neonPrimary" : "text-gray-500"}>
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
      </motion.div>

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <motion.div
        variants={bannerVariants}
        initial="hidden"
        animate="show"
        className="mb-8 md:mb-10 bg-slate-900/40 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl group transition-all duration-500 hover:shadow-[0_0_40px_rgba(124,108,255,0.15)] hover:border-neonPrimary/20"
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-neonPrimary/10 via-transparent to-neonSecondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-6 md:gap-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonPrimary via-neonAccent to-neonSecondary drop-shadow-sm tracking-tight flex items-center gap-3 mb-4">
              {greeting}, {userName}{" "}
              <span className="text-white animate-wave inline-block origin-bottom-right">👋</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                <WeatherIcon className="text-yellow-400 w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                <span className="text-sm md:text-[15px] font-semibold text-gray-200">
                  Weather: {weatherText} {weatherData ? `${weatherData.temperature}°C` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner backdrop-blur-md">
                <Activity className="text-emerald-400 w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
                <span className="text-sm md:text-[15px] font-semibold text-gray-200">
                  Today's productivity:{" "}
                  <span className="text-white font-black text-base md:text-lg ml-1">
                    {todaysProductivityStr}%
                  </span>
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
      </motion.div>

      {/* ── Animated Stat Widgets ───────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-10"
      >
        {/* Productivity */}
        <motion.div variants={itemVariants}>
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            scale={1.03}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            className="h-full"
          >
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-5 h-full flex flex-col gap-3 backdrop-blur-xl hover:border-neonPrimary/40 hover:shadow-[0_0_24px_rgba(124,108,255,0.2)] transition-all duration-500">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neonPrimary/20">
                  <TrendingUp size={14} className="text-neonPrimary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Productivity
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{todaysProductivityStr}%</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  {stats.todayCompleted}/{stats.todayTotal} tasks done
                </p>
              </div>
              <AnimatedProgressBar value={todaysProductivityStr} />
            </div>
          </Tilt>
        </motion.div>

        {/* Streak */}
        <motion.div variants={itemVariants}>
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            scale={1.03}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            className="h-full"
          >
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-5 h-full flex flex-col items-center justify-center backdrop-blur-xl hover:border-orange-500/40 hover:shadow-[0_0_24px_rgba(251,146,60,0.2)] transition-all duration-500">
              <StreakWidget completedToday={stats.todayCompleted} />
            </div>
          </Tilt>
        </motion.div>

        {/* Focus Timer */}
        <motion.div variants={itemVariants}>
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            scale={1.03}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            className="h-full"
          >
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-5 h-full flex flex-col items-center justify-center backdrop-blur-xl hover:border-neonAccent/40 hover:shadow-[0_0_24px_rgba(255,122,246,0.2)] transition-all duration-500">
              <div className="flex items-center gap-1.5 mb-3 self-start">
                <div className="p-1.5 rounded-lg bg-neonAccent/20">
                  <Timer size={14} className="text-neonAccent" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Focus Timer
                </span>
              </div>
              <FocusTimerWidget />
            </div>
          </Tilt>
        </motion.div>

        {/* AI Insight */}
        <motion.div variants={itemVariants}>
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.12}
            scale={1.03}
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            className="h-full"
          >
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 md:p-5 h-full flex flex-col justify-center backdrop-blur-xl hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.2)] transition-all duration-500">
              <AIInsightWidget />
            </div>
          </Tilt>
        </motion.div>
      </motion.div>

      {/* ── Main Nav Cards ─────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8 md:gap-20 items-center justify-items-stretch pb-24 md:pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 md:gap-8 w-full"
        >
          <motion.div variants={itemVariants}>
            <Card
              icon={
                <ClipboardList
                  size={32}
                  className="text-neonPrimary drop-shadow-[0_0_12px_rgba(124,108,255,0.6)] md:w-[40px] md:h-[40px]"
                />
              }
              image="/assets/3d/productivity_cube.png"
              title="Tasks"
              onClick={() => navigate("/tasks")}
            />
          </motion.div>

          {/* AI Assistant Card - NEW */}
          <motion.div variants={itemVariants}>
            <Card
              icon={
                <Bot
                  size={32}
                  className="text-neonAccent drop-shadow-[0_0_12px_rgba(255,122,246,0.6)] md:w-[40px] md:h-[40px]"
                />
              }
              image="/assets/3d/ai_assistant_orb.png"
              title="AI Assistant"
              onClick={() => navigate("/ai-assistant")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              icon={
                <BarChart3
                  size={32}
                  className="text-neonSecondary drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] md:w-[40px] md:h-[40px]"
                />
              }
              image="/assets/3d/analytics_chart.png"
              title="Analytics"
              onClick={() => navigate("/analytics")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              icon={
                <FileText
                  size={32}
                  className="text-neonAccent drop-shadow-[0_0_12px_rgba(255,122,246,0.6)] md:w-[40px] md:h-[40px]"
                />
              }
              image="/assets/3d/reports_doc.png"
              title="Reports"
              onClick={() => navigate("/reports")}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              icon={
                <HeartPulse
                  size={32}
                  className="text-neonHighlight drop-shadow-[0_0_12px_rgba(255,209,102,0.6)] md:w-[40px] md:h-[40px]"
                />
              }
              image="/assets/3d/health_heart.png"
              title="Health"
              onClick={() => navigate("/health")}
            />
          </motion.div>
        </motion.div>

        {/* Right decorative orbs */}
        <div className="hidden md:flex justify-center relative pointer-events-none w-full">
          <div className="absolute inset-0 bg-transparent blur-3xl rounded-full scale-75"></div>
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

// ── 3D Tilt Nav Card ──────────────────────────────────────────────────────
function Card({ icon, title, onClick, image }) {
  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.08}
      scale={1.08}
      tiltMaxAngleX={12}
      tiltMaxAngleY={12}
      transitionSpeed={1200}
      perspective={1000}
      className="h-full"
    >
      <GlassCard
        onClick={onClick}
        className="p-4 md:p-6 flex flex-col items-center justify-center group overflow-hidden relative cursor-pointer ring-1 ring-white/10 hover:ring-white/30 h-full min-h-[120px] md:min-h-[180px]"
      >
        {/* Subtle Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Hover Highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-neonPrimary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Animated Background Blob */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-neonPrimary/10 transition-all duration-1000"></div>

        {/* Card Content */}
        <div className="relative z-10 w-full flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2">
          {image ? (
            <div className="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 flex items-center justify-center">
              <motion.img 
                src={image} 
                alt={title} 
                className="w-full h-full object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" 
                whileHover={{ y: -6, filter: "drop-shadow(0 20px 20px rgba(124,108,255,0.3))" }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
          ) : (
            <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10 shadow-[inner_0_1px_1px_rgba(255,255,255,0.1)] mb-3 md:mb-4 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:border-white/20 transition-all duration-700">
              {icon}
            </div>
          )}

          <div className="relative">
            <h2 className="text-sm md:text-lg font-black text-gray-200 group-hover:text-white transition-all duration-700 text-center tracking-tight">
              {title}
            </h2>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neonPrimary/50 group-hover:w-full transition-all duration-700 rounded-full blur-[1px]"></div>
          </div>
        </div>

        {/* Titled functionality indicator */}
        <div className="absolute bottom-6 left-0 w-full text-center opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neonPrimary/40">Launch Feature</span>
        </div>
      </GlassCard>
    </Tilt>
  );
}

export default Dashboard;