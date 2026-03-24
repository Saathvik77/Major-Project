import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, CloudFog, CloudRain, Droplets, Flame, Target,
  Sun, Snowflake, Loader2, Play, Pause, Activity, CalendarDays,
  Maximize, RefreshCcw, Sparkles, Trophy, Dumbbell, Brain, Heart
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import API from "../api";
import Tilt from "react-parallax-tilt";

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

function Health() {
  const navigate = useNavigate();

  // ── Weather state ──
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [cityName, setCityName] = useState("");

  // ── AI Challenge state ──
  const [challenge, setChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [challengeError, setChallengeError] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-32 page-transition">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 max-w-5xl mx-auto mb-12 md:mb-20">

        {/* ── AI Weekly Challenge ── */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.1} className="w-full h-full flex justify-center items-center">
          <GlassCard className="relative z-10 w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group">
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
        </Tilt>

        {/* ── Weather Suggestion ── */}
        <div className="flex justify-center relative w-full h-full min-h-[300px] items-center">
          {loadingWeather ? (
            <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-center justify-center text-center border border-white/20 shadow-2xl h-full">
              <Loader2 size={40} className="text-white animate-spin mb-4" />
              <p className="text-gray-300 font-medium tracking-wide">Detecting your location...</p>
            </GlassCard>
          ) : weatherSuggestion ? (
            <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.1} className="w-full h-full flex justify-center items-center">
              <GlassCard className={`relative z-10 w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center border shadow-2xl overflow-hidden group bg-gradient-to-b ${weatherSuggestion.bg} ${weatherSuggestion.border}`}>
                <div className="flex items-center gap-2 mb-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                  <span className="text-sm font-bold tracking-widest uppercase text-white">Weather Suggestion</span>
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
            </Tilt>
          ) : (
            <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-center justify-center text-center border border-white/20 shadow-2xl h-full">
              <p className="text-red-300 font-medium">Unable to load weather data.</p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* ── Focus Tracker + Heat Map ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 max-w-5xl mx-auto mb-12 md:mb-20">

        {/* Focus Tracker */}
        <div className="flex justify-center relative w-full h-full min-h-[300px] items-center">
          <GlassCard className="relative z-10 w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group">
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

        {/* Activity Heat Map */}
        <div className="flex justify-center relative w-full h-full min-h-[300px] items-center">
          <GlassCard className="relative z-10 w-full max-w-sm p-6 sm:p-8 flex flex-col items-start border border-white/20 shadow-2xl h-full group bg-slate-900/20">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays size={24} className="text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]" />
              <h3 className="text-xl font-bold tracking-tight text-white">Activity Heat Map</h3>
            </div>

            <p className="text-sm text-gray-400 mb-6 font-medium">Your task completion consistency over the last 4 weeks.</p>

            <div className="w-full">
              <div className="grid grid-cols-7 gap-y-3 gap-x-2 w-full justify-items-center mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={i} className="text-xs font-bold text-gray-500">{d}</span>
                ))}
                {Array.from({ length: heatMapData[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-6 h-6 rounded-md bg-transparent" />
                ))}
                {heatMapData.map((data, i) => {
                  let colorClass = "bg-white/5 border border-white/5";
                  if (data.count === 1) colorClass = "bg-lime-900/40 border border-lime-800/20 shadow-[0_0_8px_rgba(132,204,22,0.3)]";
                  else if (data.count === 2) colorClass = "bg-lime-700/60 border border-lime-600 shadow-[0_0_10px_rgba(132,204,22,0.5)]";
                  else if (data.count >= 3) colorClass = "bg-lime-400 border border-lime-300 shadow-[0_0_12px_rgba(132,204,22,0.7)]";
                  return (
                    <div key={i} className={`w-6 h-6 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 relative group/tile ${colorClass}`}>
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
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5" />
                <div className="w-3 h-3 rounded-sm bg-lime-900/40 border border-lime-800/20" />
                <div className="w-3 h-3 rounded-sm bg-lime-700/60 border border-lime-600" />
                <div className="w-3 h-3 rounded-sm bg-lime-400 border border-lime-300" />
              </div>
              <span>More</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Health;