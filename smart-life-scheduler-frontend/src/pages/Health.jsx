import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, CloudFog, CloudRain, Droplets, Flame, Target,
  Sun, Snowflake, Loader2, Play, Pause, Activity, CalendarDays,
  Maximize, RefreshCcw, Sparkles, Trophy, Dumbbell, Brain, Heart,
  UtensilsCrossed, Coffee, Apple, Plus, ArrowUpRight, TrendingUp
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import API from "../api";
import Toast from "../components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

// ─── AI Weekly Challenge Generator ──────────────────────────────────────────────
async function generateChallengeFromTasks() {
  const res = await API.get("/intelligence/weekly-challenge");
  return res.data;
}

// ─── IP-based fallback location ──────────────────────────────────────────────
async function getLocationByIP() {
  const hyderabad = { lat: 17.385, lon: 78.4867, city: "Hyderabad" };

  const isInaccurateBangalore = (city) => {
    if (!city) return false;
    const lower = city.toLowerCase();
    return lower.includes("bangalore") || lower.includes("bengaluru");
  };

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    if (data.latitude && data.longitude) {
      if (isInaccurateBangalore(data.city)) return hyderabad;
      return { lat: data.latitude, lon: data.longitude, city: data.city };
    }
  } catch (_) { }

  try {
    const res2 = await fetch("https://ipinfo.io/json");
    const data2 = await res2.json();
    if (data2.loc) {
      if (isInaccurateBangalore(data2.city)) return hyderabad;
      const loc = data2.loc.split(",");
      return { lat: parseFloat(loc[0]), lon: parseFloat(loc[1]), city: data2.city };
    }
  } catch (_) { }

  // Last resort: Hyderabad, India (common fallback for your region)
  return hyderabad;
}

// ─── Challenge icon & color by type ──────────────────────────────────────────
const CHALLENGE_STYLES = {
  health: { Icon: Heart, color: "from-pink-400 to-rose-600", iconClass: "text-rose-400", glow: "rgba(244,63,94,0.8)" },
  productivity: { Icon: Trophy, color: "from-lime-300 to-emerald-600", iconClass: "text-lime-400", glow: "rgba(132,204,22,0.8)" },
  focus: { Icon: Brain, color: "from-fuchsia-400 to-purple-600", iconClass: "text-fuchsia-400", glow: "rgba(192,38,211,0.8)" },
  fitness: { Icon: Dumbbell, color: "from-cyan-300 to-blue-600", iconClass: "text-cyan-400", glow: "rgba(6,182,212,0.8)" },
};

const SPORTS_LIST = [
  { sport: "Swimming", intensity: "High", icon: Droplets, color: "text-blue-400" },
  { sport: "Cycling", intensity: "Moderate", icon: Activity, color: "text-lime-400" },
  { sport: "Running", intensity: "High", icon: Flame, color: "text-rose-400" },
  { sport: "Yoga", intensity: "Low", icon: Sparkles, color: "text-purple-400" },
  { sport: "HIIT", intensity: "Extreme", icon: Flame, color: "text-orange-500" },
  { sport: "Tennis", intensity: "Moderate", icon: Target, color: "text-yellow-400" },
  { sport: "Basketball", intensity: "High", icon: Trophy, color: "text-orange-400" },
  { sport: "Gym Workout", intensity: "High", icon: Dumbbell, color: "text-gray-300" },
  { sport: "Meditation", intensity: "Low", icon: Brain, color: "text-indigo-400" },
];

const DIET_TIPS = [
  "Prioritize high protein for muscle recovery today.",
  "Stay hydrated: Drink at least 500ml of water before each meal.",
  "Avoid heavy dinners near bedtime for better sleep quality.",
  "Incorporate healthy fats like avocado or walnuts in your lunch.",
  "Limit refined sugars to maintain steady energy levels.",
  "Eat mindfully—take at least 20 minutes for your main meals."
];

const MEAL_SUGGESTIONS = {
  breakfast: { title: "Breakfast", idea: "Oatmeal with berries & chia seeds", icon: Coffee, color: "text-amber-400" },
  lunch: { title: "Lunch", idea: "Grilled Chicken Salad with Quinoa", icon: UtensilsCrossed, color: "text-emerald-400" },
  dinner: { title: "Dinner", idea: "Baked Salmon with Steamed Broccoli", icon: Apple, color: "text-rose-400" },
};

const WEIGHT_HISTORY = [
  { name: "Mon", weight: 72.4 },
  { name: "Tue", weight: 72.1 },
  { name: "Wed", weight: 71.8 },
  { name: "Thu", weight: 71.5 },
  { name: "Fri", weight: 71.2 },
  { name: "Sat", weight: 70.6 },
  { name: "Sun", weight: 70.0 },
];

function Health() {
  const navigate = useNavigate();
  const [userWeight, setUserWeight] = useState(70);
  const [goalWeight] = useState(68.5);
  const [allTasks, setAllTasks] = useState([]);
  const [toast, setToast] = useState(null);
  const [showAllSports, setShowAllSports] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [cityName, setCityName] = useState("");

  // ── AI Challenge state ──
  const [challenge, setChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challengeError, setChallengeError] = useState(null);

  // ── Focus timer state ──
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusTime, setFocusTime] = useState(1500);
  const [focusScore, setFocusScore] = useState(85);

  // ─── Fetch weather using real location ───────────────────────────────────
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      if (data?.current_weather) {
        setWeatherData(data.current_weather);
      } else {
        setLocationError("Weather data unavailable.");
      }
    } catch {
      setLocationError("Failed to fetch weather data.");
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  // ─── Fetch tasks → used for both heatmap & AI challenge ──────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get("/tasks?limit=500");
      const tasks = res.data?.tasks || [];
      setAllTasks(tasks);
      setCompletedTasks(tasks.filter((t) => t.completed));
      return tasks;
    } catch {
      return [];
    }
  }, []);

  // ─── Generate AI challenge from tasks ────────────────────────────────────
  const loadChallenge = useCallback(async (tasks) => {
    setChallengeLoading(true);
    setChallengeError(null);
    try {
      const result = await generateChallengeFromTasks(tasks);
      setChallenge(result);
    } catch {
      setChallengeError("Could not generate challenge. Try refreshing.");
    } finally {
      setChallengeLoading(false);
    }
  }, []);

  // ─── On mount: location → weather, tasks → AI challenge ──────────────────
  useEffect(() => {
    // Tasks first (needed by both heatmap + challenge)
    fetchTasks().then((tasks) => loadChallenge(tasks));

    // Weather: try geolocation, fall back to IP
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lon } = pos.coords;
          // Reverse geocode for city name
          try {
            const geo = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const geoData = await geo.json();
            setCityName(
              geoData.city ||
              geoData.locality ||
              geoData.principalSubdivision ||
              ""
            );
          } catch (_) { }
          fetchWeather(lat, lon);
        },
        async () => {
          // Permission denied — use IP geolocation
          setLocationError("Location permission denied. Using your IP location.");
          const { lat, lon, city } = await getLocationByIP();
          setCityName(city || "");
          fetchWeather(lat, lon);
        },
        { timeout: 8000 }
      );
    } else {
      setLocationError("Geolocation not supported.");
      getLocationByIP().then(({ lat, lon, city }) => {
        setCityName(city || "");
        fetchWeather(lat, lon);
      });
    }
    // Fetch user weight
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/profile");
        const userData = res.data.user || res.data;
        if (userData?.weight) setUserWeight(userData.weight);
      } catch (err) {
        console.error("Health Profile Error:", err);
      }
    };
    fetchUser();
  }, [fetchWeather, fetchTasks, loadChallenge]);

  // ─── Focus timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isFocusing && focusTime > 0) {
      interval = setInterval(() => setFocusTime((t) => t - 1), 1000);
    } else if (focusTime === 0) {
      setIsFocusing(false);
      new Audio("/success-chime.mp3").play().catch(() => { });
      setFocusScore((s) => Math.min(100, s + 5));
    }
    return () => clearInterval(interval);
  }, [isFocusing, focusTime]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ─── Heat map ─────────────────────────────────────────────────────────────
  const heatMapData = (() => {
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (27 - i));
      const ds = d.toLocaleDateString();
      const count = completedTasks.filter(
        (t) => t.date && new Date(t.date).toLocaleDateString() === ds
      ).length;
      return { date: d, count };
    });
  })();

  // ─── Weather suggestion ───────────────────────────────────────────────────
  const getWeatherSuggestion = () => {
    if (!weatherData) return null;
    const { temperature: temp, weathercode: code } = weatherData;
    if (code <= 2 && temp >= 10 && temp <= 35)
      return {
        icon: <Sun size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />,
        title: "Sunny & Clear",
        suggestion: "Perfect weather for an outdoor run, cycling, or tennis!",
        bg: "from-lime-500/20 to-emerald-500/5",
        border: "border-lime-500/30",
      };
    if (code >= 51)
      return {
        icon: <CloudRain size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />,
        title: "Rainy Condition",
        suggestion: "It's wet outside. Time for a home HIIT session or hitting the indoor gym!",
        bg: "from-blue-500/20 to-indigo-500/5",
        border: "border-blue-500/30",
      };
    if (temp < 10 || (code >= 71 && code <= 77))
      return {
        icon: <Snowflake size={48} className="text-cyan-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.8)]" />,
        title: "Cold & Chilly",
        suggestion: "It's quite cold! Stay warm with some indoor Yoga or stretching routines.",
        bg: "from-cyan-500/20 to-blue-500/5",
        border: "border-cyan-500/30",
      };
    return {
      icon: <CloudFog size={48} className="text-gray-400 drop-shadow-[0_0_15px_rgba(156,163,175,0.8)]" />,
      title: "Mild / Overcast",
      suggestion: "Good neutral weather. A brisk walk or a regular gym workout is ideal today.",
      bg: "from-gray-500/20 to-slate-500/5",
      border: "border-gray-500/30",
    };
  };

  const weatherSuggestion = getWeatherSuggestion();

  // ─── Challenge style ──────────────────────────────────────────────────────
  const challengeStyle = challenge
    ? CHALLENGE_STYLES[challenge.type] || CHALLENGE_STYLES.productivity
    : CHALLENGE_STYLES.productivity;
  const ChallengeIcon = challengeStyle.Icon;

  const handleScheduleSport = async (sport) => {
    try {
      await API.post("/tasks", {
        title: sport.sport,
        date: new Date(),
        startTime: scheduleTime,
        priority: "High",
        duration: 60
      });
      setToast(`${sport.sport} scheduled for ${scheduleTime}! 🚀`);
      setSchedulingSport(null);
    } catch (err) {
      setToast("Failed to schedule task. Try again.");
    }
  };

  const [dietTip] = useState(DIET_TIPS[Math.floor(Math.random() * DIET_TIPS.length)]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-32 page-transition">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
      {/* Dynamic Animated background orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-lime-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-lime-600/5 rounded-full blur-[150px] -z-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-4xl font-bold tracking-tight">Health & Fitness</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20 auto-rows-max">

        {/* ── AI Weekly Challenge (Large) ── */}
        <div className="lg:col-span-2 flex justify-center items-center w-full h-full">
          <GlassCard className="relative z-10 w-full p-6 sm:p-10 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group min-h-[440px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl group-hover:bg-lime-500/20 transition-colors" />

            {/* Badge */}
            <div className="flex items-center gap-2 mb-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
              <Target size={18} className="text-lime-400" />
              <span className="text-sm font-bold tracking-widest uppercase text-lime-300">
                AI Weekly Challenge
              </span>
              <Sparkles size={14} className="text-yellow-300" />
            </div>

            {challengeLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={36} className="text-lime-400 animate-spin" />
                <p className="text-gray-400 text-sm">Analyzing your tasks with AI...</p>
              </div>
            ) : challengeError ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <p className="text-red-300 text-sm">{challengeError}</p>
                <button
                  onClick={() => loadChallenge(allTasks)}
                  className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-sm hover:bg-white/20 transition"
                >
                  Retry
                </button>
              </div>
            ) : challenge ? (
              <>
                <ChallengeIcon
                  size={48}
                  className={`mt-4 mb-3 ${challengeStyle.iconClass.replace('rose', 'lime').replace('amber', 'lime').replace('fuchsia', 'lime').replace('cyan', 'lime').replace('orange', 'lime')} drop-shadow-[0_0_15px_${challengeStyle.glow}] transform group-hover:scale-110 transition-transform duration-300`}
                />

                <h3 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-sm">
                  {challenge.title}
                </h3>

                <p className="text-xs text-gray-400 mb-5 px-2 leading-relaxed">
                  {challenge.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-4 mb-3 border border-slate-700/50 overflow-hidden shadow-inner">
                  <div
                    className={`bg-gradient-to-r from-lime-400 to-lime-600 h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${(0 / (challenge.target || 7)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between w-full text-sm font-bold text-gray-300 tracking-wide mt-1">
                  <span>Progress</span>
                  <span className="text-lime-300 bg-lime-500/20 px-2 py-0.5 rounded-md border border-lime-500/30">
                    0 / {challenge.target} {challenge.unit}
                  </span>
                </div>

                <div className="w-full mt-6 flex gap-2">
                  <button className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 group/btn">
                    <Flame size={18} className="text-lime-400 group-hover/btn:scale-125 transition-transform" />
                    <span className="font-bold text-white tracking-wide">Log Progress</span>
                  </button>
                  {/* Refresh challenge */}
                  <button
                    onClick={() => loadChallenge(allTasks)}
                    title="Generate new AI challenge"
                    className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <Sparkles size={18} className="text-yellow-300" />
                  </button>
                </div>
              </>
            ) : null}
          </GlassCard>
        </div>

        {/* ── Weather Suggestion ── */}
        <div className="lg:col-span-1 flex justify-center relative w-full h-full items-center">
          {loadingWeather ? (
            <GlassCard className="relative z-10 w-full p-8 flex flex-col items-center justify-center text-center border border-white/20 shadow-2xl h-full min-h-[440px]">
              <Loader2 size={40} className="text-white animate-spin mb-4" />
              <p className="text-gray-300 font-medium tracking-wide text-sm">Detecting location...</p>
            </GlassCard>
          ) : weatherSuggestion ? (
            <div className="w-full h-full flex justify-center items-center">
              <GlassCard className={`relative z-10 w-full p-6 sm:p-8 flex flex-col items-center text-center border shadow-2xl overflow-hidden group bg-gradient-to-b min-h-[440px] ${weatherSuggestion.bg} ${weatherSuggestion.border}`}>
                <div className="flex items-center gap-2 mb-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                  <span className="text-[10px] font-black tracking-widest uppercase text-white">Weather Insight</span>
                </div>

                {/* City name */}
                {cityName && (
                  <p className="text-xs text-gray-400 mb-4">📍 {cityName}</p>
                )}

                <div className="transform group-hover:scale-110 transition-transform duration-500 mb-4">
                  {weatherSuggestion.icon}
                </div>

                <h3 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight drop-shadow-sm">
                  {weatherSuggestion.title}
                </h3>

                <p className="text-3xl font-black text-white mb-6 drop-shadow-md">
                  {weatherData.temperature}°C
                </p>

                <div className="bg-black/20 p-4 rounded-xl border border-white/10 w-full">
                  <p className="text-[15px] text-gray-200 font-medium leading-relaxed">
                    {weatherSuggestion.suggestion}
                  </p>
                </div>

                {/* Only show error if it's truly a problem, not just "using IP" */}
                {locationError && locationError.includes("denied") && (
                  <p className="text-xs text-lime-300/70 mt-4">
                    📡 Using IP-based location for weather accuracy.
                  </p>
                )}
              </GlassCard>
            </div>
          ) : (
            <GlassCard className="relative z-10 w-full p-8 flex flex-col items-center justify-center text-center border border-white/20 shadow-2xl h-full min-h-[440px]">
              <p className="text-red-300 font-medium">Weather unavailabe.</p>
            </GlassCard>
          )}
        </div>

        {/* ── Focus Tracker ── */}
        <div className="lg:col-span-1 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group min-h-[440px]">
            <div className="absolute top-0 left-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl group-hover:bg-lime-500/20 transition-colors" />

            <div className="flex items-center gap-2 mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
              <Activity size={18} className="text-lime-400" />
              <span className="text-sm font-bold tracking-widest uppercase text-lime-300">Focus Intensity</span>
            </div>

            <div className="relative flex justify-center items-center w-40 h-40 mb-6 group-hover:scale-105 transition-transform">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="76" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="80" cy="80" r="76" fill="transparent" stroke="currentColor" strokeWidth="6"
                  strokeDasharray="477"
                  strokeDashoffset={477 - 477 * (focusTime / 1500)}
                  strokeLinecap="round"
                  className="text-lime-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <p className="text-4xl font-black text-white tracking-widest drop-shadow-md">
                {formatTime(focusTime)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setIsFocusing((f) => !f)} className="bg-lime-600 hover:bg-lime-500 text-white p-4 rounded-full shadow-[0_0_15px_rgba(132,204,22,0.5)] transition-transform active:scale-95">
                {isFocusing ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={() => { setIsFocusing(false); setFocusTime(1500); }} className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full border border-white/10 transition-colors active:scale-95">
                <RefreshCcw size={24} />
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 w-full flex justify-between items-center px-2">
              <span className="text-sm font-medium text-gray-400">Current Focus Score</span>
              <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <Maximize size={16} /> {focusScore}%
              </span>
            </div>
          </GlassCard>
        </div>

        {/* ── Hydration Tracker ── */}
        <div className="lg:col-span-1 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group min-h-[440px]">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
            
            <div className="flex items-center gap-2 mb-6 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full shadow-inner">
              <Droplets size={18} className="text-blue-400" />
              <span className="text-sm font-bold tracking-widest uppercase text-blue-300">Hydration Target</span>
            </div>

            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                <Droplets size={40} className="text-blue-400 animate-bounce" />
              </div>
            </div>

            <h3 className="text-3xl font-black text-white mb-2">
              {(userWeight * 0.033).toFixed(2)} <span className="text-lg text-gray-400 font-medium">L</span>
            </h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 leading-tight">Daily suggested ({userWeight}kg)</p>

            <div className="w-full space-y-3 mt-auto">
              <div className="flex justify-between text-xs font-bold text-gray-400 px-1">
                <span>Progress</span>
                <span>~ {Math.ceil((userWeight * 0.033) / 0.25)} Glasses</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 border border-slate-700/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full w-1/3 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
          </GlassCard>
        </div>
        {/* ── Diet Suggestions ── */}
        <div className="lg:col-span-1 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-8 flex flex-col items-start border border-white/20 shadow-2xl overflow-hidden group min-h-[440px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors" />
            
            <div className="flex items-center gap-2 mb-6 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded-full shadow-inner">
              <UtensilsCrossed size={18} className="text-rose-400" />
              <span className="text-sm font-bold tracking-widest uppercase text-rose-300">Diet Suggestions</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 w-full group-hover:bg-white/10 transition-colors">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-1.5">Nutrition Tip</p>
              <p className="text-md font-bold text-white leading-tight italic">"{dietTip}"</p>
            </div>

            <div className="space-y-3 w-full">
              {Object.values(MEAL_SUGGESTIONS).map((meal, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:translate-x-1">
                  <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center ${meal.color}`}>
                    <meal.icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{meal.title}</p>
                    <p className="font-bold text-white text-xs">{meal.idea}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Activity Heat Map (Large) ── */}
        <div className="lg:col-span-2 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-10 flex flex-col items-start border border-white/20 shadow-2xl h-full group bg-slate-900/20 min-h-[440px]">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays size={24} className="text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
              <h3 className="text-xl font-bold tracking-tight text-white">Activity Heat Map</h3>
            </div>

            <p className="text-sm text-gray-400 mb-8 font-medium">Your task completion consistency over the last 4 weeks.</p>

            <div className="w-full flex justify-center">
              <div className="grid grid-cols-7 gap-y-4 gap-x-3 w-full max-w-md justify-items-center mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="text-xs font-bold text-gray-500">{d}</span>
                ))}
                {Array.from({ length: heatMapData[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-8 h-8 rounded-md bg-transparent" />
                ))}
                {heatMapData.map((data, i) => {
                  let colorClass = "bg-white/5 border border-white/5";
                  if (data.count === 1) colorClass = "bg-lime-900/40 border border-lime-800/20 shadow-[0_0_8px_rgba(132,204,22,0.3)]";
                  else if (data.count === 2) colorClass = "bg-lime-700/60 border border-lime-600 shadow-[0_0_10px_rgba(132,204,22,0.5)]";
                  else if (data.count >= 3) colorClass = "bg-lime-400 border border-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.7)]";
                  return (
                    <div key={i} className={`w-8 h-8 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 relative group/tile ${colorClass}`}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0b0b12] text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover/tile:opacity-100 pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/20">
                        {data.count} tasks on {data.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto w-full pt-4 flex items-center justify-between text-xs font-medium text-gray-400">
              <span>Less</span>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-sm bg-white/5 border border-white/5" />
                <div className="w-4 h-4 rounded-sm bg-lime-900/40 border border-lime-800/20" />
                <div className="w-4 h-4 rounded-sm bg-lime-700/60 border border-lime-600" />
                <div className="w-4 h-4 rounded-sm bg-lime-400 border border-lime-300" />
              </div>
              <span>More</span>
            </div>
          </GlassCard>
        </div>

        {/* ── Sports Recommendation ── */}
        <div className="lg:col-span-1 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-8 flex flex-col items-start border border-white/20 shadow-2xl overflow-hidden group min-h-[440px]">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors" />
            
            <div className="flex items-center gap-2 mb-6 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full shadow-inner">
              <Trophy size={18} className="text-orange-400" />
              <span className="text-sm font-bold tracking-widest uppercase text-orange-300">Recommended Sports</span>
            </div>

            <div className="space-y-3 w-full overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
              {(showAllSports ? SPORTS_LIST : SPORTS_LIST.slice(0, 3)).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item">
                  <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center ${item.color} group-hover/item:scale-110 transition-transform`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-white text-xs">{item.sport}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-tight">{item.intensity}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/tasks', { state: { presetTask: `Workout: ${item.sport}` } })}
                    className="px-3 py-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20 text-lime-400 text-[10px] font-black uppercase tracking-wider hover:bg-lime-500 hover:text-white transition-all"
                  >
                    Schedule
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowAllSports(!showAllSports)}
              className="w-full mt-auto py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              {showAllSports ? "Show Less" : "Explore More Sports"}
            </button>

          </GlassCard>
        </div>

        {/* ── Weight Tracking System (Full Width) ── */}
        <div className="lg:col-span-3 flex justify-center relative w-full h-full items-center">
          <GlassCard className="relative z-10 w-full p-6 sm:p-10 flex flex-col md:flex-row items-center border border-white/20 shadow-2xl h-full group bg-slate-900/40 min-h-[440px] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="w-full md:w-1/3 flex flex-col items-start gap-8 z-10">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-inner">
                <TrendingUp size={18} className="text-emerald-400" />
                <span className="text-sm font-bold tracking-widest uppercase text-emerald-300">Weight Tracker</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Current Weight</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter flex items-end gap-2">
                    {userWeight} <span className="text-xl text-emerald-400 font-bold mb-2">kg</span>
                  </h3>
                </div>

                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Change</p>
                    <p className="text-xl font-black text-emerald-400 tracking-tight flex items-center gap-1">
                      <ArrowUpRight size={16} className="rotate-90 scale-y-[-1]" /> -2.4 kg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Goal Weight</p>
                    <p className="text-xl font-black text-gray-300 tracking-tight">{goalWeight} kg</p>
                  </div>
                </div>
              </div>

              <div className="w-full pt-4 mt-auto">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
                  <span>Progress to Goal</span>
                  <span>{Math.round(((72.4 - userWeight) / (72.4 - goalWeight)) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                    style={{ width: `${Math.round(((72.4 - userWeight) / (72.4 - goalWeight)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3 h-full min-h-[280px] md:min-h-0 pl-0 md:pl-12 mt-10 md:mt-0 items-center justify-center flex">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={WEIGHT_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

export default Health;