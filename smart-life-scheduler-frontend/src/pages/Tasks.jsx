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

const getTaskStartMs = (task) => {
  if (!task.startTime || !task.date) return null;
  const [hh, mm] = task.startTime.split(":").map(Number);
  const base = new Date(task.date);
  base.setHours(hh, mm, 0, 0);
  return base.getTime();
};

const getTaskEndMs = (task) => {
  const start = getTaskStartMs(task);
  if (!start) return null;
  return start + (task.duration || 60) * 60 * 1000;
};

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
            <p className="text-white font-semibold text-[14px] leading-tight">Task Window Ended</p>
            <p className="text-sm text-gray-400 mt-0.5 truncate">
              "<span className="text-orange-300 font-medium">{task.title}</span>" was missed and remains uncompleted.
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
  const [weatherData, setWeatherData] = useState(null);
  const [repeatFrequency, setRepeatFrequency] = useState("once");
  const [repeatDays, setRepeatDays] = useState([]);
  const [isReschedulingModalOpen, setIsReschedulingModalOpen] = useState(false);
  const [reschedulingTasks, setReschedulingTasks] = useState([]);
  const alarmRef = useRef(null);
  const informedRef  = useRef(new Set());
  const autoRescheduledRef = useRef(new Set());
  const navigate = useNavigate();

  // Initialize Alarm Audio (One-time)
  useEffect(() => {
    alarmRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1017/1017-preview.mp3");
    alarmRef.current.loop = true;
  }, []);

  const playAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.play().catch(e => console.log("Audio blocked by browser. Click anywhere to enable."));
    }
  };

  const stopAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  };

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
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(`/tasks?date=${dateStr}&limit=100`);
      
      const allTasks = res.data.tasks || [];
      setTasks(allTasks); 
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
      let newAlarmTriggered = false;

      setTasks(prev => {
        const nextExpired = new Set(expiredIds);
        prev.forEach(task => {
          if (task.completed) return;
          const endMs = getTaskEndMs(task);
          const taskId = task._id || task.id;
          if (endMs && now >= endMs && !nextExpired.has(taskId)) {
            // Check if it's the current date
            const tDate = new Date(task.date);
            const today = new Date();
            if (tDate.toDateString() === today.toDateString()) {
              nextExpired.add(taskId);
              newAlarmTriggered = true;
              if (!pendingNotification) {
                setPendingNotification(task);
              }
            }
          }
        });

        if (newAlarmTriggered) {
          playAlarm();
          setExpiredIds(nextExpired);
        }
        return prev;
      });
    }, 10000); // Check every 10s for snappier alarms
    return () => clearInterval(interval);
  }, [fetchTasks, expiredIds, pendingNotification]);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      let finalDays = [];
      if (repeatFrequency === 'custom') finalDays = repeatDays;
      else if (repeatFrequency === 'workdays') finalDays = [1, 2, 3, 4, 5];
      else if (repeatFrequency === 'daily') finalDays = [0, 1, 2, 3, 4, 5, 6];

      const res = await api.post("/tasks", {
        title, date: selectedDate, duration: 60,
        priority, startTime: startTime || "09:00",
        repeatFrequency,
        repeatDays: finalDays
      });
      setTasks([...tasks, res.data.task]);
      setTitle(""); 
      setStartTime("");
      setRepeatFrequency("once");
      setRepeatDays([]);
      setToast("Task deployed successfully 🚀");
    } catch (err) { console.error(err); }
  };

  const completeTask = async (taskId) => {
    try {
      setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: true } : t));
      await api.patch(`/tasks/${taskId}`, { completed: true });
      setToast("Task completed! Keep up the momentum 🔥");
    } catch (err) { 
      console.error(err); 
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

  const openRescheduleModal = (tasksToReschedule) => {
    const list = Array.isArray(tasksToReschedule) ? tasksToReschedule : [tasksToReschedule];
    const prepared = list.map(t => ({ ...t, newTime: t.startTime }));
    setReschedulingTasks(prepared);
    setIsReschedulingModalOpen(true);
  };

  const handleApplyReschedule = async () => {
    setIsLoading(true);
    try {
      const promises = reschedulingTasks.map(task => 
        api.post(`/tasks/${task._id || task.id}/reschedule`, { targetTime: task.newTime })
      );
      await Promise.all(promises);
      setIsReschedulingModalOpen(false);
      fetchTasks();
      setToast("Tasks rescheduled successfully! Operational flow restored. 🚀");
    } catch (err) { 
      console.error(err); 
      setToast("Synchronization failed. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyOptimization = async () => {
    const missedTasks = tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id));
    if (missedTasks.length === 0) {
      setToast("No missed tasks to optimize!");
      return;
    }
    openRescheduleModal(missedTasks);
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
    <div className="min-h-screen pl-0 md:pl-[84px] p-4 md:p-8 lg:p-12 text-white relative flex flex-col max-w-7xl mx-auto pb-24 page-transition overflow-y-auto overflow-x-hidden">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {pendingNotification && (
          <RescheduleNotification 
            task={pendingNotification}
            onDismiss={() => {
              setPendingNotification(null);
              stopAlarm();
            }}
            onReschedule={(t) => {
              setPendingNotification(null);
              stopAlarm();
              openRescheduleModal(t);
            }}
          />
        )}
      </AnimatePresence>

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
          
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
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

              <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                
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
                    {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <AlertCircle size={14} className="text-rose-500" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/80">Missed Tasks</h4>
                        </div>
                        <div className="space-y-3">
                          {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).map((task) => (
                            <TaskItem 
                              key={task._id || task.id}
                              title={task.title}
                              time={formatTime12Hour(task.startTime)}
                              priority={task.priority}
                              onComplete={() => completeTask(task._id || task.id)}
                              onDelete={() => deleteTask(task._id || task.id)}
                              onReschedule={() => openRescheduleModal(task)}
                              isExpired={true}
                              category={task.category || "General"}
                              className="task-missed"
                            />
                          ))}
                        </div>
                      </div>
                    )}

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
                                            onReschedule={() => openRescheduleModal(task)}
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
                              onComplete={() => {}} 
                              onDelete={() => deleteTask(task._id || task.id)}
                              onReschedule={() => {
                                const confirm = window.confirm(`Re-open "${task.title}" for rescheduling?`);
                                if (confirm) {
                                  openRescheduleModal(task);
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

                <div className="glass-card p-8 flex flex-col gap-8 border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] -z-10" />
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Task Configuration</h4>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Alarm Mode</span>
                      </div>
                    </div>

                    <div className="flex items-center bg-white/5 rounded-[2rem] px-8 py-6 border border-white/5 focus-within:border-orange-500/30 transition-all shadow-inner">
                      <input 
                        type="text" 
                        placeholder="What's the next objective?" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-gray-700 tracking-tight"
                      />
                    </div>

                    {/* Alarm Time Picker Mock/UI */}
                    <div className="flex flex-col items-center gap-8 py-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                        <div className="flex items-center gap-12">
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Hour</span>
                             <div className="text-5xl font-black text-white tracking-tighter flex items-end gap-1">
                                {startTime?.includes(':') ? (() => {
                                  const h24 = parseInt(startTime.split(':')[0]);
                                  const h12 = h24 % 12 || 12;
                                  return String(h12).padStart(2, '0');
                                })() : "09"}
                                <span className="text-sm text-gray-500 mb-2 font-bold">h</span>
                             </div>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Minute</span>
                             <div className="text-5xl font-black text-white tracking-tighter flex items-end gap-1">
                                {startTime?.includes(':') ? startTime.split(':')[1] : "00"}
                                <span className="text-sm text-gray-500 mb-2 font-bold">min</span>
                             </div>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Period</span>
                             <div className="text-3xl font-black text-orange-500 tracking-tighter mt-2">
                                {startTime?.includes(':') ? (parseInt(startTime.split(':')[0]) >= 12 ? "PM" : "AM") : "AM"}
                             </div>
                           </div>
                        </div>

                        <input 
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="absolute opacity-0 w-px h-px pointer-events-none"
                          id="hidden-time-input"
                        />
                        <button 
                          onClick={() => document.getElementById('hidden-time-input')?.showPicker?.()}
                          className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          Adjust Time
                        </button>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                        {['once', 'workdays', 'custom'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setRepeatFrequency(mode)}
                            className={`flex-1 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                              repeatFrequency === mode 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {mode === 'once' ? 'Ring once' : mode === 'workdays' ? 'Workdays' : 'Custom'}
                          </button>
                        ))}
                    </div>

                    {/* Day Selector Component */}
                    {(repeatFrequency === 'custom' || repeatFrequency === 'workdays' || repeatFrequency === 'daily') && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Repeat Schedule</span>
                           <span className="text-[10px] font-bold text-orange-500">
                             {repeatFrequency === 'workdays' ? 'Mon - Fri' : 'Every day'}
                           </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 bg-white/5 p-3 rounded-3xl border border-white/5">
                           {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                             const isSelected = repeatFrequency === 'daily' || 
                                              (repeatFrequency === 'workdays' && idx >= 1 && idx <= 5) ||
                                              (repeatFrequency === 'custom' && repeatDays.includes(idx));
                             return (
                               <button
                                 key={idx}
                                 onClick={() => {
                                   if (repeatFrequency !== 'custom') return;
                                   const next = repeatDays.includes(idx) 
                                     ? repeatDays.filter(d => d !== idx)
                                     : [...repeatDays, idx];
                                   setRepeatDays(next);
                                 }}
                                 className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                   isSelected 
                                     ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110' 
                                     : 'bg-white/5 text-gray-500 border border-white/5'
                                 }`}
                               >
                                 {day}
                               </button>
                             );
                           })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/5 rounded-2xl px-6 py-4 border border-white/5 flex items-center gap-3">
                        <SlidersHorizontal size={16} className="text-gray-500" />
                        <select 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none cursor-pointer"
                        >
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>
                      </div>
                      <button 
                        onClick={addTask}
                        className="h-14 px-8 rounded-2xl bg-orange-500 text-white flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 group"
                      >
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deploy Task</span>
                        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
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

        {isAiCoachOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg glass-card border border-indigo-500/30 bg-[#0f1115]/95 shadow-[0_20px_60px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col relative"
            >
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

      <AnimatePresence>
        {isReschedulingModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReschedulingModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-morphism rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <RefreshCcw size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Smart Reschedule</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Operational Sync Protocol</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReschedulingModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Analyze your remaining capacity. At what time would you like to re-synchronize these missed operational windows?
                </p>

                {reschedulingTasks.map((task, idx) => (
                  <div key={task._id || idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{task.title}</h4>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">Missed</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-1">Original Time</label>
                          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
                             {formatTime12Hour(task.startTime)}
                          </div>
                       </div>
                       <div className="flex-1">
                          <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2 px-1">New Sync Time</label>
                          <input 
                             type="time"
                             value={task.newTime || ""}
                             onChange={(e) => {
                               const next = [...reschedulingTasks];
                               next[idx].newTime = e.target.value;
                               setReschedulingTasks(next);
                             }}
                             className="w-full px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-black"
                          />
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-white/5 bg-black/20 shrink-0">
                <button 
                  onClick={handleApplyReschedule}
                  disabled={isLoading || reschedulingTasks.some(t => !t.newTime)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Resynchronizing..." : "Apply Operational Sync"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
