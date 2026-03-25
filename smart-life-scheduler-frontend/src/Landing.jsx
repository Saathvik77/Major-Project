import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Landing() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-y-auto overflow-x-hidden pb-20">

      {/* Animated Background Glow — lime emerald to match theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime-700 opacity-10 blur-3xl rounded-full animate-floatGlow"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-5 backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent truncate">
          Smart Life Scheduler
        </h1>

        {token ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="liquid-glass liquid-glass-lime px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shrink-0"
          >
            Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="liquid-glass liquid-glass-lime px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shrink-0"
          >
            Login
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-20 md:mt-28 px-6 animate-fadeIn">

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
          Design Your Life.
          <br className="hidden sm:block" />
          Master Your Time.
        </h2>

        <p className="text-slate-400 max-w-xl mb-10 text-base md:text-lg">
          AI-powered scheduling, intelligent analytics, and adaptive life optimization — all in one powerful system.
        </p>

        {/* Premium CTA Button */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 via-emerald-500 to-lime-400 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300"></div>

          <button 
            onClick={() => navigate(token ? "/dashboard" : "/login")}
            className="liquid-glass liquid-glass-emerald px-10 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            Get Started
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">


          <div>
            <h3 className="text-3xl font-bold text-emerald-400">98%</h3>
            <p className="text-slate-400 mt-2">Task Completion Boost</p>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-lime-300">35K+</h3>
            <p className="text-slate-400 mt-2">Schedules Optimized</p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Landing;
