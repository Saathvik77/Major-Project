import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import FloatingAICoach from "./FloatingAICoach";
import api from "../api";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAiPage = location.pathname === "/ai-assistant";
  const [weatherData, setWeatherData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("User");

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/tasks?limit=50")
      ]);
      setUserName((userRes.data.user || userRes.data).name || "User");
      setTasks(tasksRes.data.tasks || []);
    } catch (e) {
      console.error("Layout global data fetch failed", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Re-fetch when tasks are updated
    const handleUpdate = () => fetchData();
    window.addEventListener("tasksUpdated", handleUpdate);
    
    // Weather fetch
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const data = await res.json();
          setWeatherData(data.current_weather);
        } catch (e) { console.error("Weather fetch failed", e); }
      }, () => {});
    }

    return () => window.removeEventListener("tasksUpdated", handleUpdate);
  }, [fetchData]);

  return (
    <div className="flex bg-transparent min-h-screen relative overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-20 md:pb-6 md:ml-20 lg:ml-24 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global AI Coach Overlay */}
      {!isAiPage && (
        <FloatingAICoach 
          weatherData={weatherData} 
          tasks={tasks} 
          userName={userName} 
        />
      )}
    </div>
  );
}
