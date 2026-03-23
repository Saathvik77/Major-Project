import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import api from "../api";
import {
  ChevronLeft, ChevronRight, Menu, RefreshCcw, MoreHorizontal,
  Dumbbell, Briefcase, BookOpen, Trash2, Plus, SlidersHorizontal,
  ChevronDown, CheckCircle, Sparkles, Bot, CalendarClock, Bell, X,
  AlertCircle, Layout, Eye, Lightbulb, BarChart3 as BarChartIcon,
  Timer, TrendingUp, BrainCircuit, Zap, Calendar as CalendarIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import TaskItem from "../components/TaskItem";
import Toast from "../components/Toast";

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatTime12Hour = (time24) => {
  if (!time24) return "—";
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const getTaskEndMs = (task) => {
  if (!task.startTime || !task.date) return null;
  const [hh, mm] = task.startTime.split(":").map(Number);
  const base = new Date(task.date);
  base.setHours(hh, mm, 0, 0);
  return base.getTime() + (task.duration || 60) * 60 * 1000;
};

const ONE_HOUR_MS  = 60 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

// ─── Notification Toast Component ─────────────────────────────────────────
function RescheduleNotification({ task, onReschedule, onDismiss }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[92vw] max-w-md animate-slideDown">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(249,115,22,0.2)] flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
            <Bell size={16} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[14px] leading-tight">Task time ended</p>
            <p className="text-sm text-gray-400 mt-0.5 truncate">
              "<span className="text-orange-300 font-medium">{task.title}</span>" wasn't marked complete.
            </p>
          </div>
          <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onReschedule(task)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            <CalendarClock size={13} />
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks]               = useState([]);
  const [title, setTitle]               = useState("");
  const [startTime, setStartTime]       = useState("");
  const [priority, setPriority]         = useState("Medium");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expiredIds, setExpiredIds]         = useState(new Set());
  const [pendingNotification, setPendingNotification] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [isAiCoachOpen, setIsAiCoachOpen]   = useState(false);
  const [isOptimizing, setIsOptimizing]     = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [aiMessage, setAiMessage]           = useState("");
  const [aiChatResponse, setAiChatResponse]   = useState("");
  const [isAiLoading, setIsAiLoading]         = useState(false);
  const notifiedRef  = useRef(new Set());
  const autoRescheduledRef = useRef(new Set());
  const navigate = useNavigate();

  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Basic weather fetch for AI suggestions
    const fetchW = async () => {
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
    };
    fetchW();
  }, []);

  const handleAiAsk = async () => {
    if (!aiMessage.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.post("/ai/chat", { 
        message: aiMessage,
        weatherData: weatherData 
      });
      setAiChatResponse(res.data.reply);
      setAiMessage("");
      if (res.data.actions) {
         // If there are actions (like navigation or task creation), we might need to refresh
         fetchTasks();
      }
    } catch (err) {
      setAiChatResponse("I'm having trouble connecting to my neural network. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass the selected date to the backend for robust filtering
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(`/tasks?date=${dateStr}&limit=100`);
      
      const allTasks = res.data.tasks || [];
      // Secondary local filter to ensure exact match ignoring time
      const filtered = allTasks.filter(task => {
        const tDate = new Date(task.date);
        return tDate.getUTCFullYear() === selectedDate.getFullYear() &&
               tDate.getUTCMonth() === selectedDate.getMonth() &&
               tDate.getUTCDate() === selectedDate.getDate();
      });
      setTasks(filtered);
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleUpdate = () => fetchTasks();
    window.addEventListener("tasksUpdated", handleUpdate);
    return () => window.removeEventListener("tasksUpdated", handleUpdate);
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      const now = Date.now();
      setTasks(prev => {
        const nextExpired = new Set(expiredIds);
        prev.forEach(task => {
          if (task.completed) return;
          const endMs = getTaskEndMs(task);
          if (endMs && now > endMs) nextExpired.add(task._id || task.id);
        });
        setExpiredIds(nextExpired);
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/tasks", {
        title, date: selectedDate, duration: 60,
        priority, startTime: startTime || "09:00"
      });
      setTasks([...tasks, res.data.task]);
      setTitle(""); 
      setStartTime("");
      setToast("Task added successfully");
    } catch (err) { console.error(err); }
  };

  const completeTask = async (taskId) => {
    try {
      // Optimistically update local state to show completion
      setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: true } : t));
      await api.patch(`/tasks/${taskId}`, { completed: true });
      setToast("Task completed! Keep up the momentum 🔥");
    } catch (err) { 
      console.error(err); 
      // Rollback on error
      fetchTasks();
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setTasks(tasks.filter(t => (t._id || t.id) !== taskId));
      await api.delete(`/tasks/${taskId}`);
      setToast("Task deleted successfully");
    } catch (err) { console.error(err); }
  };

  const rescheduleTask = async (task) => {
    try {
      const id = task._id || task.id;
      const res = await api.post(`/tasks/${id}/reschedule`);
      setTasks(prev => prev.map(t => (t._id || t.id) === id ? res.data.task : t));
      setExpiredIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setToast(`Rescheduled to ${formatTime12Hour(res.data.task.startTime)}`);
    } catch (err) { console.error(err); }
    setPendingNotification(null);
  };

  const applyOptimization = async () => {
    const missedTasks = tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id));
    if (missedTasks.length === 0) {
      setToast("No missed tasks to optimize!");
      return;
    }
    
    // ─── Propose Optimization Flow ───────────────────────────────────
    const confirm = window.confirm(`Smart Life Engine has detected ${missedTasks.length} missed operational tasks. 

Would you like to initiate the 'Smart Sync' protocol? 
This will analyze your remaining windows and automatically reschedule these tasks to the next available slots to maintain your daily momentum.`);

    if (!confirm) return;

    setIsOptimizing(true);
    try {
      // 🚀 WOW FEATURE: SMART AUTO RESCHEDULE
      const promises = missedTasks.map(task => api.post(`/tasks/${task._id || task.id}/reschedule`));
      const results = await Promise.all(promises);
      
      const newTasksMap = new Map();
      results.forEach(res => {
        const t = res.data.task;
        newTasksMap.set(t._id || t.id, t);
      });

      setTasks(prev => prev.map(t => newTasksMap.has(t._id || t.id) ? newTasksMap.get(t._id || t.id) : t));
      
      setExpiredIds(prev => {
        const next = new Set(prev);
        results.forEach(res => next.delete(res.data.task._id || res.data.task.id));
        return next;
      });
      
      setToast(`Smart Sync complete. ${results.length} tasks successfully reintegrated into your flow.`);
    } catch (err) {
      console.error(err);
      setToast("Optimization encountered an error.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const generateWeek = (baseDate) => {
    const week = [];
    const cur = new Date(baseDate);
    cur.setDate(cur.getDate() - 3);
    for (let i = 0; i < 7; i++) { 
        week.push(new Date(cur)); 
        cur.setDate(cur.getDate() + 1); 
    }
    return week;
  };

  const weekDates = generateWeek(selectedDate);
  const monthName = selectedDate.toLocaleString('default', { month: 'short' });
  const dayName   = selectedDate.getDate();

  const getDayStats = () => {
    const total = tasks.length;
    if (total === 0) return { completed: 0, missed: 0, percent: 0 };
    const completed = tasks.filter(t => t.completed).length;
    const missed = expiredIds.size;
    const percent = Math.round((completed / total) * 100);
    return { completed, missed, percent };
  };

  const { completed: completedStat, missed: missedStat, percent: percentStat } = getDayStats();

  if (isLoading) {
    return (
      <div className="min-h-screen pl-0 md:pl-[84px] p-4 md:p-8 lg:p-12 text-white flex flex-col gap-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl skeleton" />
          <div className="space-y-2">
            <div className="w-48 h-8 skeleton" />
            <div className="w-32 h-4 skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-4">
             {[1, 2, 3, 4].map(i => <div key={i} className="h-24 glass-card skeleton border-none" />)}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
             <div className="h-64 glass-card skeleton border-none" />
             <div className="h-64 glass-card skeleton border-none" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 text-white relative flex flex-col gap-10 max-w-7xl mx-auto page-transition overflow-hidden">
      {pendingNotification && <RescheduleNotification task={pendingNotification} onReschedule={rescheduleTask} onDismiss={() => setPendingNotification(null)} />}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 shrink-0">
            <Layout size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Operational Flow</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">Manage Tasks & Performance</p>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl w-full lg:w-auto">
          <button onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(prev);
          }} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 lg:flex-none text-center px-6 py-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest">{selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</span>
          </div>
          <button onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(next);
          }} className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Main Task Column */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            
            {/* Date Scroller */}
            <div className="glass-card p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-2">
                {weekDates.map((d, i) => {
                  const isActive = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                  const dStr = d.toLocaleString('default', { weekday: 'short' });
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(new Date(d))} 
                      className={`
                        flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl transition-all cursor-pointer border shrink-0
                        ${isActive 
                          ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10'}
                      `}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>{dStr}</span>
                      <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{d.getDate()}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task List Section */}
            <div className="glass-card p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Planned Schedule</h3>
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                </div>
                <div onClick={fetchTasks} className="text-[10px] font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                   SYNC CALENDAR
                </div>
              </div>

              <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 glass-card border-dashed bg-white/[0.01]">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500/40 mb-6 border border-orange-500/20">
                      <CalendarIcon size={32} strokeWidth={1} />
                    </div>
                    <h4 className="text-white font-black text-lg mb-2">Operational void detected</h4>
                    <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
                      No tasks scheduled for this cycle. Use the quick add bar above or click "AI Plan My Day" on the dashboard.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Missed Tasks Section */}
                    {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <AlertCircle size={14} className="text-rose-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/80">Missed Tasks</h4>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).map((task, index) => (
                            <TaskItem 
                              key={task._id || task.id}
                              title={task.title}
                              time={formatTime12Hour(task.startTime)}
                              priority={task.priority}
                              onComplete={() => completeTask(task._id || task.id)}
                              onDelete={() => deleteTask(task._id || task.id)}
                              onReschedule={() => rescheduleTask(task)}
                              isExpired={true}
                              category={task.category || "General"}
                              className="task-missed"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Today's Tasks Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Today's Schedule</h4>
                      </div>
                      
                      {tasks.filter(t => !t.completed && !expiredIds.has(t._id || t.id)).length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="py-12 flex flex-col items-center justify-center text-center glass-card border-dashed bg-white/[0.01]"
                        >
                          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                            <CheckCircle size={32} strokeWidth={1.5} />
                          </div>
                          <h4 className="text-white font-bold">No pending tasks today 🎉</h4>
                          <p className="text-xs text-gray-500 mt-1 max-w-[200px]">You're all caught up! Take some time to recharge.</p>
                        </motion.div>
                      ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId="tasks-list">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                {tasks.filter(t => !t.completed && !expiredIds.has(t._id || t.id)).map((task, index) => {
                                  const id = task._id || task.id;
                                  return (
                                    <Draggable key={id} draggableId={String(id)} index={index}>
                                      {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                          <TaskItem 
                                            title={task.title}
                                            time={formatTime12Hour(task.startTime)}
                                            priority={task.priority}
                                            onComplete={() => completeTask(id)}
                                            onDelete={() => deleteTask(id)}
                                            onReschedule={() => rescheduleTask(task)}
                                            isExpired={false}
                                            category={task.category || "General"}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      )}
                    </div>

                    {/* Completed Tasks Section */}
                    {tasks.filter(t => t.completed).length > 0 && (
                      <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 px-1">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Completed Performance</h4>
                        </div>
                        <div className="space-y-3 opacity-60 grayscale-[0.5]">
                          {tasks.filter(t => t.completed).map((task) => (
                            <TaskItem 
                              key={task._id || task.id}
                              title={task.title}
                              time={formatTime12Hour(task.startTime)}
                              priority={task.priority}
                              onComplete={() => {}} // Already complete
                              onDelete={() => deleteTask(task._id || task.id)}
                              onReschedule={() => {
                                const confirm = window.confirm(`Re-open "${task.title}" for rescheduling?`);
                                if (confirm) {
                                  // Call the reschedule logic which will also reset completed status on backend (if handled)
                                  // Or we might need to manually set completed: false if the backend doesn't
                                  rescheduleTask(task);
                                }
                              }}
                              isExpired={false}
                              category={task.category || "General"}
                              isCompleted={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Inline Add Task */}
                <div className="glass-card p-4 flex flex-col gap-4 border border-white/10 shadow-2xl">
                  <div className="flex items-center bg-white/5 rounded-2xl px-6 py-4 border border-white/5 focus-within:border-orange-500/30 transition-all">
                    <input 
                      type="text" 
                      placeholder="Initiate new operational task..." 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input 
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm text-white"
                    />
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="flex-1 min-w-[120px] bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none focus:border-orange-500/30 cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <button 
                      onClick={addTask}
                      className="w-full md:w-14 h-14 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex-shrink-0"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* AI Optimization Card */}
            <div className="glass-card p-8 bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] -z-10 group-hover:bg-orange-500/20 transition-all" />
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/5">
                        <Sparkles size={24} />
                     </div>
                     <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Smart Sync</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Smart Auto-Reschedule</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AI Engine Active</span>
                  </div>
               </div>
               <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  Detected <span className="text-orange-400 font-bold">{expiredIds.size} missed syncs</span>. Our smart engine can automatically find the next optimal window based on your performance patterns.
               </p>
               <motion.button 
                 whileHover={{ scale: 1.02, y: -2 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={applyOptimization}
                 disabled={isOptimizing || expiredIds.size === 0}
                 className="w-full py-4 rounded-[1.25rem] bg-orange-500 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 ripple"
               >
                  {isOptimizing ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" />
                      Synchronizing Smart Flow...
                    </>
                  ) : (
                    <>
                      <Zap size={16} fill="currentColor" />
                      Apply Smart Optimization
                    </>
                  )}
               </motion.button>
            </div>

            {/* Day Stats Ring (Glassmorphism design) */}
            <div className="glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-8 self-start flex items-center gap-2">
                  <TrendingUp size={14} className="text-orange-500" />
                  Activity Momentum
               </h3>
               
               <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" className="stroke-white/5 fill-none" strokeWidth="10" />
                    <motion.circle 
                      cx="96" cy="96" r="88" 
                      className="stroke-orange-500 fill-none shadow-[0_0_15px_rgba(255,140,60,0.4)]" 
                      strokeWidth="10" 
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{ strokeDasharray: `${(percentStat / 100) * 553} 553` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white tracking-tighter">{percentStat}%</span>
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest mt-1">Focus Flow</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Completed</p>
                     <p className="text-lg font-black text-orange-500">{completedStat}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Remaining</p>
                     <p className="text-lg font-black text-white">{tasks.length - completedStat}</p>
                  </div>
               </div>
            </div>

            {/* AI Coach Sessions */}
            <div 
              onClick={() => setIsAiCoachOpen(true)}
              className="glass-card p-6 group cursor-pointer hover:bg-white/[0.05] transition-all border border-transparent hover:border-indigo-500/30"
            >
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_10px_30px_rgba(99,102,241,0.2)]">
                     <BrainCircuit size={22} />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold mb-1 text-white group-hover:text-indigo-400 transition-colors">AI Coach Review</h4>
                     <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Available Now</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
               </div>
            </div>

          </div>
        </div>

        {/* Floating AI Coach Modal */}
        {isAiCoachOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg glass-card border border-indigo-500/30 bg-[#0f1115]/95 shadow-[0_20px_60px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col relative"
            >
              {/* Premium Glow Effect inside Modal */}
              <div className="absolute top-0 inset-x-0 h-40 bg-radial-gradient from-indigo-500/20 to-transparent opacity-50 pointer-events-none" />
              
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white/90">Smart Coach</h3>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Active Analysis</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiCoachOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 relative z-10 flex-1 overflow-y-auto">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                    <Sparkles size={14} className="text-indigo-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed rounded-tl-sm">
                    {aiChatResponse || (
                      <>
                        Hey! I've analyzed your recent tasks. Your completion rate is looking solid at <strong>{percentStat}%</strong> today. 
                        <br/><br/>
                        However, I noticed a trend where afternoon energy dips. Try scheduling heavy cognitive tasks before 1 PM and leave administrative work for later.
                      </>
                    )}
                    {isAiLoading && <div className="mt-2 flex gap-1"><span className="w-1 h-1 bg-indigo-400 animate-bounce rounded-full" /><span className="w-1 h-1 bg-indigo-400 animate-bounce delay-75 rounded-full" /><span className="w-1 h-1 bg-indigo-400 animate-bounce delay-150 rounded-full" /></div>}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 relative z-10 flex items-center gap-3">
                 <input 
                   type="text" 
                   placeholder="Ask the coach for strategic advice..." 
                   value={aiMessage}
                   onChange={(e) => setAiMessage(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                 />
                 <button 
                   onClick={handleAiAsk}
                   disabled={isAiLoading || !aiMessage.trim()}
                   className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                 >
                   <ChevronRight size={20} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}

    </div>
  );
}
