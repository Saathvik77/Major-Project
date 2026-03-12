import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CloudFog, CloudRain, Droplets, Flame, Target, Sun, Snowflake, Loader2, Play, Pause, Activity, CalendarDays, Maximize, RefreshCcw } from "lucide-react";
import GlassCard from "../components/GlassCard";
import API from "../api";
import Tilt from "react-parallax-tilt";

function Health() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Weekly Challenge Mock Data
  const [challenge] = useState({
    title: "Drink 2.5L Water Daily",
    target: 7,
    current: 4,
    unit: "days",
    icon: Droplets,
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-500/50"
  });

  const [completedTasks, setCompletedTasks] = useState([]);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusTime, setFocusTime] = useState(1500); // 25 minutes in seconds
  const [focusScore, setFocusScore] = useState(85);

  useEffect(() => {
    // Fetch Weather Data
    const fetchWeather = async (lat, lon) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        
        if (data && data.current_weather) {
            setWeatherData(data.current_weather);
        } else {
            setLocationError("Weather data unavailable.");
        }
      } catch (error) {
        setLocationError("Failed to fetch weather data.");
      } finally {
        setLoadingWeather(false);
      }
    };

    // Fetch Tasks Data for Heatmap
    const fetchTasksForHeatMap = async () => {
       try {
           const res = await API.get("/tasks?limit=500");
           if (res.data && res.data.tasks) {
               setCompletedTasks(res.data.tasks.filter(t => t.completed));
           }
       } catch (error) {
           console.error("Failed to fetch tasks for heatmap:", error);
       }
    };

    fetchTasksForHeatMap();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setLocationError("Location access denied. Give permissions to see contextual weather advice.");
          setLoadingWeather(false);
          fetchWeather(51.5074, -0.1278); 
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setLoadingWeather(false);
    }
  }, []);

  // Timer logic for Focus session
  useEffect(() => {
    let interval;
    if (isFocusing && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setIsFocusing(false);
      // Play alarm/chime
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(e => console.error(e));
      setFocusScore(prev => Math.min(100, prev + 5));
    }
    return () => clearInterval(interval);
  }, [isFocusing, focusTime]);

  const toggleFocus = () => {
    setIsFocusing(!isFocusing);
  };
  
  const resetFocus = () => {
     setIsFocusing(false);
     setFocusTime(1500);
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Generate simple heat map data (last 28 days)
  const generateHeatMapData = () => {
      const dates = [];
      const today = new Date();
      // Look back 28 days (4 weeks)
      for (let i = 27; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateString = d.toLocaleDateString();
          
          // Count completed tasks for this date
          const count = completedTasks.filter(t => {
              if(!t.date) return false;
              return new Date(t.date).toLocaleDateString() === dateString;
          }).length;
          
          dates.push({ date: d, count });
      }
      return dates;
  };

  const heatMapData = generateHeatMapData();

  // Determine suggestion based on weather
  const getWeatherSuggestion = () => {
    if (!weatherData) return null;
    const temp = weatherData.temperature;
    // WMO Weather interpretation codes
    const code = weatherData.weathercode; 
    
    // Sunny/Clear (Codes 0, 1, 2)
    if (code <= 2 && temp >= 10 && temp <= 32) {
        return {
            icon: <Sun size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />,
            title: "Sunny & Clear",
            suggestion: "Perfect weather for an outdoor run, cycling, or tennis!",
            bg: "from-yellow-500/20 to-orange-500/5",
            border: "border-yellow-500/30"
        };
    }
    
    // Rainy/Drizzle/Thunderstorm (Codes 51-99)
    if (code >= 51) {
        return {
            icon: <CloudRain size={48} className="text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />,
            title: "Rainy Condition",
            suggestion: "It's wet outside. Time for a home HIIT session or hitting the indoor gym!",
            bg: "from-blue-500/20 to-indigo-500/5",
            border: "border-blue-500/30"
        };
    }
    
    // Cold or Snow (Temp < 10 or Snow codes 71-77)
    if (temp < 10 || (code >= 71 && code <= 77)) {
        return {
            icon: <Snowflake size={48} className="text-cyan-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.8)]" />,
            title: "Cold & Chilly",
            suggestion: "It's quite cold! Stay warm with some indoor Yoga or stretching routines.",
            bg: "from-cyan-500/20 to-blue-500/5",
            border: "border-cyan-500/30"
        };
    }
    
    // Default / Cloudy (Codes 3, 45, 48)
    return {
        icon: <CloudFog size={48} className="text-gray-400 drop-shadow-[0_0_15px_rgba(156,163,175,0.8)]" />,
        title: "Mild / Overcast",
        suggestion: "Good neutral weather. A brisk walk or a regular gym workout is ideal today.",
        bg: "from-gray-500/20 to-slate-500/5",
        border: "border-gray-500/30"
    };
  };

  const weatherSuggestion = getWeatherSuggestion();
  const ChallengeIcon = challenge.icon;

  return (
    <div className="min-h-screen px-4 md:px-16 py-10 relative z-10 font-sans text-white pb-28">
      {/* Dynamic Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-4xl font-bold tracking-tight">Health & Fitness</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          
        {/* Weekly Challenge Widget */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full h-full flex justify-center items-center">
          <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group">
            {/* Animated Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-colors"></div>

            <div className="flex items-center gap-2 mb-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
               <Target size={18} className="text-pink-400" />
               <span className="text-sm font-bold tracking-widest uppercase text-pink-300">Weekly Challenge</span>
            </div>

            <ChallengeIcon size={48} className={`mt-4 mb-3 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] transform group-hover:scale-110 transition-transform duration-300`} />
            
            <h3 className="text-2xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-sm">
              {challenge.title}
            </h3>

            <div className="w-full bg-slate-800/80 rounded-full h-4 mb-3 border border-slate-700/50 overflow-hidden shadow-inner">
              <div 
                className={`bg-gradient-to-r ${challenge.color} h-full rounded-full transition-all duration-1000 ease-out relative`} 
                style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
              >
                 <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full"></div>
              </div>
            </div>

            <div className="flex justify-between w-full text-sm font-bold text-gray-300 tracking-wide mt-1">
              <span>Progress</span>
              <span className="text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {challenge.current} / {challenge.target} {challenge.unit}
              </span>
            </div>
            
            <div className="w-full mt-6">
               <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 group/btn">
                  <Flame size={18} className="text-orange-400 group-hover/btn:scale-125 transition-transform" />
                  <span className="font-bold text-white tracking-wide">Log Progress</span>
               </button>
            </div>
          </GlassCard>
        </Tilt>

        {/* Weather-Based Suggestions Widget */}
        <div className="flex justify-center relative w-full h-full min-h-[300px] items-center">
            {loadingWeather ? (
                 <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-center justify-center text-center border border-white/20 shadow-2xl h-full">
                    <Loader2 size={40} className="text-white animate-spin mb-4" />
                    <p className="text-gray-300 font-medium tracking-wide">Analyzing local weather...</p>
                 </GlassCard>
            ) : weatherSuggestion ? (
                <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.1} className="w-full h-full flex justify-center items-center">
                    <GlassCard className={`relative z-10 w-full max-w-sm p-8 flex flex-col items-center text-center border shadow-2xl overflow-hidden group bg-gradient-to-b ${weatherSuggestion.bg} ${weatherSuggestion.border}`}>
                         <div className="flex items-center gap-2 mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                            <span className="text-sm font-bold tracking-widest uppercase text-white">Weather Suggestion</span>
                         </div>
                         
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
                         
                         {locationError && (
                             <p className="text-xs text-red-300 mt-4 opacity-70">
                                 Note: {locationError} Using fallback location.
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
      
      {/* Activity Heat Map & Focus Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pb-10">
          {/* Focus Tracker */}
          <div className="flex justify-center relative w-full h-full min-h-[300px] items-center">
             <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-center text-center border border-white/20 shadow-2xl overflow-hidden group">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors"></div>
                 
                 <div className="flex items-center gap-2 mb-6 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
                    <Activity size={18} className="text-purple-400" />
                    <span className="text-sm font-bold tracking-widest uppercase text-purple-300">Focus Intensity</span>
                 </div>

                 {/* Timer Display */}
                 <div className="relative flex justify-center items-center w-40 h-40 mb-6 group-hover:scale-105 transition-transform">
                     <svg className="absolute w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="76" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle 
                            cx="80" 
                            cy="80" 
                            r="76" 
                            fill="transparent" 
                            stroke="currentColor" 
                            strokeWidth="6" 
                            strokeDasharray="477" 
                            strokeDashoffset={477 - (477 * (focusTime / 1500))} 
                            strokeLinecap="round"
                            className="text-purple-500 transition-all duration-1000 ease-linear"
                        />
                     </svg>
                     <p className="text-4xl font-black text-white tracking-widest drop-shadow-md">
                         {formatTime(focusTime)}
                     </p>
                 </div>

                 <div className="flex items-center gap-4">
                     <button 
                        onClick={toggleFocus}
                        className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-transform active:scale-95"
                     >
                        {isFocusing ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                     </button>
                     <button 
                        onClick={resetFocus}
                        className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full border border-white/10 transition-colors active:scale-95"
                     >
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
             <GlassCard className="relative z-10 w-full max-w-sm p-8 flex flex-col items-start border border-white/20 shadow-2xl h-full group bg-slate-900/40">
                 <div className="flex items-center gap-2 mb-6">
                    <CalendarDays size={24} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    <h3 className="text-xl font-bold tracking-tight text-white">Activity Heat Map</h3>
                 </div>

                 <p className="text-sm text-gray-400 mb-6 font-medium">Your task completion consistency over the last 4 weeks.</p>
                 
                 <div className="w-full">
                     <div className="grid grid-cols-7 gap-y-3 gap-x-2 w-full justify-items-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <span key={i} className="text-xs font-bold text-gray-500">{day}</span>
                        ))}
                        
                        {/* Pad the beginning if the first date isn't Sunday */}
                        {Array.from({ length: heatMapData[0].date.getDay() }).map((_, i) => (
                             <div key={`pad-${i}`} className="w-6 h-6 rounded-md bg-transparent"></div>
                        ))}

                        {heatMapData.map((data, i) => {
                            let colorClass = "bg-white/5 border border-white/5";
                            if (data.count === 1) colorClass = "bg-emerald-900 border border-emerald-800 shadow-[0_0_8px_rgba(6,78,59,0.5)]";
                            else if (data.count === 2) colorClass = "bg-emerald-700 border border-emerald-600 shadow-[0_0_10px_rgba(4,120,87,0.6)]";
                            else if (data.count >= 3) colorClass = "bg-emerald-500 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]";
                            
                            return (
                                <div 
                                    key={i} 
                                    className={`w-6 h-6 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 relative group/tile ${colorClass}`}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover/tile:opacity-100 pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/10">
                                        {data.count} tasks on {data.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                 </div>

                 <div className="mt-auto w-full pt-4 flex items-center justify-between text-xs font-medium text-gray-400">
                     <span>Less</span>
                     <div className="flex gap-1">
                         <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5"></div>
                         <div className="w-3 h-3 rounded-sm bg-emerald-900 border border-emerald-800"></div>
                         <div className="w-3 h-3 rounded-sm bg-emerald-700 border border-emerald-600"></div>
                         <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400"></div>
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
