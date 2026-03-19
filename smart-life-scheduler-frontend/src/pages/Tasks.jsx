import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api";
import {
  ChevronLeft, ChevronRight, Menu, RefreshCcw, MoreHorizontal,
  Dumbbell, Briefcase, BookOpen, Trash2, Plus, SlidersHorizontal,
  ChevronDown, CheckCircle, Sparkles, Bot, CalendarClock, Bell, X,
  AlertCircle, Layout, Eye, Search, Lightbulb, BarChart3 as BarChartIcon,
  Timer
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import TaskItem from "../components/TaskItem";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// ─── Helpers ───────────────────────────────────────────────────────────────
const timeToMinutes = (time) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return "--:--";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
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
            <p className="text-xs text-gray-500 mt-1">Do you want to reschedule it to a free slot?</p>
          </div>
          <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onReschedule(task)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500/80 to-amber-500/80 text-white text-xs font-bold hover:from-orange-500 hover:to-amber-500 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
          >
            <CalendarClock size={13} />
            Reschedule Now
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[200] animate-slideUp">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-teal-500/30 rounded-2xl px-5 py-3 shadow-[0_0_20px_rgba(45,212,191,0.2)] text-sm font-semibold text-teal-300 flex items-center gap-2">
        <CalendarClock size={15} />
        {message}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks]               = useState([]);
  const [title, setTitle]               = useState("");
  const [startTime, setStartTime]       = useState("");
  const [priority, setPriority]         = useState("Medium");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSyncing, setIsSyncing]       = useState(false);
  const [aiSchedule, setAiSchedule]     = useState(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [fetchError, setFetchError] = useState("");

  const [expiredIds, setExpiredIds]         = useState(new Set());
  const [rescheduledIds, setRescheduledIds] = useState(new Set());
  const [pendingNotification, setPendingNotification] = useState(null);
  const [toast, setToast]                   = useState(null);
  const notifiedRef  = useRef(new Set());
  const autoRescheduledRef = useRef(new Set());

  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      setFetchError("");
      const res = await api.get("/tasks?limit=50");
      let fetchedTasks = res.data.tasks || [];
      const dateKey = `task-order-${selectedDate.toDateString()}`;
      const savedOrderStr = localStorage.getItem(dateKey);
      if (savedOrderStr) {
        try {
          const savedOrder = JSON.parse(savedOrderStr);
          fetchedTasks.sort((a, b) => {
            const idA = a._id || a.id;
            const idB = b._id || b.id;
            const iA = savedOrder.indexOf(idA);
            const iB = savedOrder.indexOf(idB);
            if (iA !== -1 && iB !== -1) return iA - iB;
            if (iA !== -1) return -1;
            if (iB !== -1) return 1;
            return 0;
          });
        } catch (e) { console.error(e); }
      }
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
      setFetchError("Failed to fetch tasks.");
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
    window.addEventListener("tasksUpdated", fetchTasks);
    return () => window.removeEventListener("tasksUpdated", fetchTasks);
  }, []);

  useEffect(() => { fetchTasks(); }, [selectedDate]);

  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      setTasks(prev => {
        let changed = false;
        const nextExpired = new Set(expiredIds);
        const nextRescheduled = new Set(rescheduledIds);
        prev.forEach(task => {
          if (task.completed) return;
          const id = task._id || task.id;
          const endMs = getTaskEndMs(task);
          if (endMs === null) return;
          const elapsed = now - endMs;
          if (elapsed > 0) {
            if (!nextExpired.has(id)) { nextExpired.add(id); changed = true; }
            if (elapsed >= ONE_HOUR_MS && !notifiedRef.current.has(id) && !pendingNotification) {
              notifiedRef.current.add(id);
              setPendingNotification(task);
            }
            if (elapsed >= TWO_HOURS_MS && !autoRescheduledRef.current.has(id)) {
              autoRescheduledRef.current.add(id);
              api.post(`/tasks/${id}/reschedule`)
                .then(res => {
                  const updatedTask = res.data.task;
                  setTasks(t => t.map(tk => (tk._id || tk.id) === id ? updatedTask : tk));
                  nextExpired.delete(id); nextRescheduled.add(id);
                  setExpiredIds(new Set(nextExpired)); setRescheduledIds(new Set(nextRescheduled));
                  setToast(`"${task.title}" auto-rescheduled to ${updatedTask.startTime}`);
                })
                .catch(err => console.error(err));
            }
          }
        });
        if (changed) setExpiredIds(new Set(nextExpired));
        return prev;
      });
    };
    const interval = setInterval(checkExpiry, 30_000);
    return () => clearInterval(interval);
  }, [tasks]);

  const rescheduleTask = async (task) => {
    const id = task._id || task.id;
    try {
      const res = await api.post(`/tasks/${id}/reschedule`);
      const updatedTask = res.data.task;
      setTasks(prev => prev.map(t => (t._id || t.id) === id ? updatedTask : t));
      setExpiredIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      notifiedRef.current.delete(id);
      setToast(`"${task.title}" rescheduled to ${updatedTask.startTime}`);
    } catch (err) { console.error(err); }
    setPendingNotification(null);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/tasks", {
        title, description: "General task", date: selectedDate, duration: 60,
        priority, deadline: selectedDate, startTime: startTime || "09:00"
      });
      setTasks([...tasks, res.data.task]);
      setTitle(""); setStartTime(""); setPriority("Medium");
    } catch (err) { console.error(err); }
  };

  const completeTask = async (taskId) => {
    try {
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      setExpiredIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
      await api.patch(`/tasks/${taskId}`, { completed: true });
    } catch (err) { console.error(err); }
  };

  const syncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => { fetchTasks(); setIsSyncing(false); }, 1000);
  };

  const generateMyDay = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post("/tasks/generate-schedule");
      setAiSchedule(res.data.schedule);
    } catch (err) { console.error(err); }
    finally { setIsGenerating(false); }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const activeTasks = tasks.filter(t => !t.completed);
    const arr = Array.from(activeTasks);
    const [item] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, item);
    setTasks([...arr, ...tasks.filter(t => t.completed)]);
    localStorage.setItem(`task-order-${selectedDate.toDateString()}`, JSON.stringify(arr.map(t => t._id || t.id)));
  };

  const generateWeek = (baseDate) => {
    const week = [];
    const cur = new Date(baseDate);
    cur.setDate(cur.getDate() - 3);
    for (let i = 0; i < 7; i++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
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

  return (
    <div className="min-h-screen pb-28 font-sans relative overflow-x-hidden text-white bg-[#0a0a0c]">
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      {pendingNotification && <RescheduleNotification task={pendingNotification} onReschedule={rescheduleTask} onDismiss={() => setPendingNotification(null)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="max-w-[1400px] mx-auto pt-6 px-6 relative z-10 w-full">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition text-gray-400">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-300">Tasks</span>
          </div>
          <h1 className="text-sm font-black text-white tracking-[0.3em] uppercase absolute left-1/2 -translate-x-1/2">TASKS</h1>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition text-gray-400">
              <Layout size={18} />
            </button>
            <button className="p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition text-gray-400">
              <Menu size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="glass-card p-8 bg-white/[0.03] border-white/5 shadow-2xl rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3 cursor-pointer group">
                <h2 className="text-3xl font-bold text-white">{monthName} {dayName}</h2>
                <ChevronDown size={24} className="text-gray-500 group-hover:text-gray-300 mt-1 transition" />
              </div>
              <button onClick={syncCalendar} className="flex items-center gap-2 text-xs font-bold text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                <span>Sync</span> <Search size={14} className="text-gray-500" />
              </button>
            </div>

            <div className="flex justify-between items-center mb-12 gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {weekDates.map((d, i) => {
                const isActive = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                const dayStr = d.toLocaleString('default', { weekday: 'short' });
                return (
                  <div key={i} onClick={() => setSelectedDate(new Date(d))} className={`flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-[2rem] transition-all cursor-pointer border ${isActive ? 'bg-gradient-to-b from-cyan-400/20 to-transparent border-cyan-400/40 active-date-glow' : 'bg-white/5 border-white/5'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isActive ? 'text-white' : 'text-gray-500'}`}>{dayStr}</span>
                    <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{d.getDate()}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-white">Today</h3>
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>

              <div className="space-y-3">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="tasks-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {tasks.filter(t => !t.completed).map((task, index) => {
                          const id = task._id || task.id;
                          const isExpired = expiredIds.has(id);
                          
                          if (isExpired) {
                            return (
                              <Draggable key={id} draggableId={String(id)} index={index}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group">
                                    <div className="backdrop-blur-xl bg-red-500/[0.08] border border-red-500/20 rounded-[2rem] p-5 flex items-center justify-between transition-all hover:bg-red-500/[0.12] relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
                                      <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 text-red-400">
                                          <AlertCircle size={24} />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-lg font-bold text-white tracking-tight truncate">{task.title}</h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5">
                                              <Timer size={14} className="text-red-400/60" /> {formatTime12Hour(task.startTime)}
                                            </span>
                                          </div>
                                          <div className="mt-2 flex items-center gap-2">
                                            <div className="bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                               <Eye size={12} className="text-gray-500" />
                                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Missed at</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 relative z-10">
                                        <button onClick={() => rescheduleTask(task)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:bg-white/10 transition">+1 hour</button>
                                        <button onClick={() => rescheduleTask(task)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 hover:bg-white/10 transition">Evening</button>
                                        <button onClick={() => completeTask(id)} className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-[11px] font-black text-white hover:bg-red-500/40 transition flex items-center gap-2 shadow-lg shadow-red-500/10">
                                          Mark Done <ChevronRight size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          }

                          return (
                            <Draggable key={id} draggableId={String(id)} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <TaskItem 
                                    title={task.title}
                                    time={formatTime12Hour(task.startTime)}
                                    priority={task.priority}
                                    onComplete={() => completeTask(id)}
                                    isExpired={false}
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

                <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.03] rounded-[2rem] p-4 flex items-center gap-4 group transition-all">
                  <div className="w-10 h-10 flex items-center justify-center text-gray-600"><Plus size={20} /></div>
                  <input type="text" placeholder="Add new task..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-600 font-medium text-base" />
                  <MoreHorizontal size={20} className="text-gray-700 cursor-pointer hover:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 bg-white/[0.03] border-white/5 rounded-[2.5rem]">
              <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Lightbulb size={18} /></div><h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Suggestions</h3></div>
              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed font-medium">You missed <span className="text-white">{missedStat}</span> recent tasks. Consider shifting your morning tasks to match your peak focus time!</p>
                <div className="pt-2"><button onClick={generateMyDay} className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all">Reschedule All</button></div>
              </div>
            </div>

            <div className="glass-card p-6 bg-white/[0.03] border-white/5 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center justify-between mb-8"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400"><BarChartIcon size={18} /></div><h3 className="text-sm font-bold text-white uppercase tracking-widest">Task Insights</h3></div><MoreHorizontal size={18} className="text-gray-600" /></div>
               <div className="flex items-end justify-between"><div className="space-y-4"><div className="flex items-baseline gap-2"><span className="text-2xl font-black text-white">{completedStat}</span><span className="text-xs font-bold text-gray-500 uppercase">Completed</span></div><div className="flex items-baseline gap-2"><span className="text-2xl font-black text-red-500/80">{missedStat}</span><span className="text-xs font-bold text-gray-500 uppercase">Missed</span></div></div>
                 <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter">{percentStat}<span className="text-lg opacity-40">%</span></p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 w-24 overflow-hidden"><div className="h-full bg-cyan-400 transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.6)]" style={{ width: `${percentStat}%` }} /></div>
                 </div>
               </div>
            </div>

             <div className="glass-card p-6 bg-white/[0.03] border-white/5 rounded-[2.5rem] group opacity-80 hover:opacity-100 transition-opacity">
               <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400"><Lightbulb size={18} /></div><h3 className="text-sm font-bold text-white uppercase tracking-widest">AI Scheduling</h3></div><MoreHorizontal size={18} className="text-gray-600" /></div>
               <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed font-medium">You missed 2 recent tasks. Consider shifting your morning tasks to match your peak focus time!</p>
                <button onClick={generateMyDay} className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-white/10 transition-all">Reschedule All</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
