import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api";
import {
  ChevronLeft, ChevronRight, Menu, RefreshCcw, MoreHorizontal,
  Dumbbell, Briefcase, BookOpen, Trash2, Plus, SlidersHorizontal,
  ChevronDown, CheckCircle, Sparkles, Bot, CalendarClock, Bell, X
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

/** Returns the epoch ms when a task's scheduled window ends, or null if no time set */
const getTaskEndMs = (task) => {
  if (!task.startTime || !task.date) return null;
  const [hh, mm] = task.startTime.split(":").map(Number);
  const base = new Date(task.date);
  base.setHours(hh, mm, 0, 0);
  return base.getTime() + (task.duration || 60) * 60 * 1000;
};

const ONE_HOUR_MS  = 60 * 60 * 1000;   // 1 hour
const TWO_HOURS_MS = 2  * 60 * 60 * 1000; // 2 hours

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

// ─── Toast (auto-dismiss) ─────────────────────────────────────────────────
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

  // Expiry state
  const [expiredIds, setExpiredIds]               = useState(new Set());      // task IDs that are expired
  const [rescheduledIds, setRescheduledIds]       = useState(new Set());     // task IDs auto-rescheduled this session
  const [pendingNotification, setPendingNotification] = useState(null);      // task to show 1-hour prompt for
  const [toast, setToast]                         = useState(null);          // auto-dismiss toast message
  const notifiedRef  = useRef(new Set()); // IDs where 1-hr notification already fired this session
  const autoRescheduledRef = useRef(new Set()); // IDs where 2-hr auto-reschedule already fired

  const navigate = useNavigate();

  // ── Fetch tasks ────────────────────────────────────────────────────────
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
      if (!err.response) {
        setFetchError("Network error: Server might be starting up. Please wait...");
      } else {
        setFetchError("Failed to fetch tasks.");
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
    window.addEventListener("tasksUpdated", fetchTasks);
    return () => window.removeEventListener("tasksUpdated", fetchTasks);
  }, []);

  useEffect(() => { fetchTasks(); }, [selectedDate]);

  // ── Expiry polling (every 30s) ─────────────────────────────────────────
  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();

      setTasks(prev => {
        let changed = false;
        const nextExpired    = new Set(expiredIds);
        const nextRescheduled = new Set(rescheduledIds);

        prev.forEach(task => {
          if (task.completed) return;
          const id    = task._id || task.id;
          const endMs = getTaskEndMs(task);
          if (endMs === null) return;

          const elapsed = now - endMs;

          if (elapsed > 0) {
            // Mark expired in local state
            if (!nextExpired.has(id)) {
              nextExpired.add(id);
              changed = true;
            }

            // ── 1-hour notification ──────────────────────────────────
            if (elapsed >= ONE_HOUR_MS && !notifiedRef.current.has(id) && !pendingNotification) {
              notifiedRef.current.add(id);
              setPendingNotification(task);
            }

            // ── 2-hour auto-reschedule ──────────────────────────────
            if (elapsed >= TWO_HOURS_MS && !autoRescheduledRef.current.has(id)) {
              autoRescheduledRef.current.add(id);
              // Fire async without blocking render
              api.post(`/tasks/${id}/reschedule`)
                .then(res => {
                  const updatedTask = res.data.task;
                  setTasks(t => t.map(tk => (tk._id || tk.id) === id ? updatedTask : tk));
                  nextExpired.delete(id);
                  nextRescheduled.add(id);
                  setExpiredIds(new Set(nextExpired));
                  setRescheduledIds(new Set(nextRescheduled));
                  setToast(`"${task.title}" has been auto-rescheduled to ${updatedTask.startTime}`);
                })
                .catch(err => console.error("Auto-reschedule error:", err));
            }
          }
        });

        if (changed) {
          setExpiredIds(new Set(nextExpired));
        }
        return prev; // tasks state unchanged; only expiredIds/rescheduledIds change
      });
    };

    checkExpiry(); // run immediately on task load
    const interval = setInterval(checkExpiry, 30_000); // then every 30s
    return () => clearInterval(interval);
  }, [tasks]); // re-run when tasks list updates

  // ── Reschedule (manual) ────────────────────────────────────────────────
  const rescheduleTask = async (task) => {
    const id = task._id || task.id;
    try {
      const res = await api.post(`/tasks/${id}/reschedule`);
      const updatedTask = res.data.task;
      setTasks(prev => prev.map(t => (t._id || t.id) === id ? updatedTask : t));
      setExpiredIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      notifiedRef.current.delete(id);
      setToast(`"${task.title}" rescheduled to ${updatedTask.startTime}`);
    } catch (err) {
      console.error("Reschedule error:", err);
    }
    setPendingNotification(null);
  };

  const dismissNotification = () => setPendingNotification(null);

  // ── Task CRUD ──────────────────────────────────────────────────────────
  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/tasks", {
        title,
        description: "General task",
        date: selectedDate,
        duration: 60,
        priority,
        deadline: selectedDate,
        startTime: startTime || "09:00"
      });
      setTasks([...tasks, res.data.task]);
      setTitle("");
      setStartTime("");
      setPriority("Medium");
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(() => {});
    } catch (err) {
      console.error("Add task error:", err.response?.data || err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error("Delete task error:", err.response?.data || err);
      fetchTasks();
    }
  };

  const completeTask = async (taskId) => {
    try {
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      setExpiredIds(prev => { const s = new Set(prev); s.delete(taskId); return s; });
      setPendingNotification(n => (n && (n._id || n.id) === taskId) ? null : n);
      await api.patch(`/tasks/${taskId}`, { completed: true });
      window.dispatchEvent(new Event("tasksUpdated"));
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(() => {});
    } catch (err) {
      console.error("Complete task error:", err.response?.data || err);
      fetchTasks();
    }
  };

  const syncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => { fetchTasks(); setIsSyncing(false); }, 1000);
  };

  // ── AI Schedule ────────────────────────────────────────────────────────
  const generateMyDay = async () => {
    setIsGenerating(true);
    setGeneratingStep(0);
    setAiSchedule(null);
    setAiExplanation("");

    const steps = [
      { delay: 0    },
      { delay: 1000 },
      { delay: 2200 },
      { delay: 3400 },
    ];
    steps.forEach(({ delay }, i) => setTimeout(() => setGeneratingStep(i), delay));

    try {
      const res = await api.post("/tasks/generate-schedule");
      setAiSchedule(res.data.schedule);
      setAiExplanation(res.data.explanation || "");
    } catch (err) {
      console.error("Failed to generate schedule", err);
    } finally {
      setIsGenerating(false);
      setGeneratingStep(0);
    }
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const activeTasks = tasks.filter(t => !t.completed);
    const arr = Array.from(activeTasks);
    const [item] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, item);
    const completed = tasks.filter(t => t.completed);
    setTasks([...arr, ...completed]);
    const orderedIds = arr.map(t => t._id || t.id);
    localStorage.setItem(`task-order-${selectedDate.toDateString()}`, JSON.stringify(orderedIds));
  };

  // ── Calendar ───────────────────────────────────────────────────────────
  const generateWeek = (baseDate) => {
    const week = [];
    const cur = new Date(baseDate);
    cur.setDate(cur.getDate() - 3);
    for (let i = 0; i < 6; i++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    return week;
  };

  const weekDates  = generateWeek(selectedDate);
  const monthName  = selectedDate.toLocaleString('default', { month: 'short' });
  const dayName    = selectedDate.getDate();

  const getDayProgress = () => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return "Anytime";
    const [hours24, minutes] = time24.split(":");
    if (!hours24 || !minutes) return time24;
    const h = parseInt(hours24, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hours12 = ((h + 11) % 12 + 1).toString().padStart(2, '0');
    return `${hours12}:${minutes} ${suffix}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28 font-sans relative overflow-x-hidden text-white">
      {/* Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" />
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '2s' }} />
      <div className="fixed top-[40%] left-[60%] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '4s' }} />

      {/* 1-Hour Reschedule Notification */}
      {pendingNotification && (
        <RescheduleNotification
          task={pendingNotification}
          onReschedule={rescheduleTask}
          onDismiss={dismissNotification}
        />
      )}

      {/* Auto-dismiss success toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="max-w-md lg:max-w-5xl mx-auto pt-8 px-6 relative z-10 lg:w-full">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">Tasks</h1>
          <button className="p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white">
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Date Row */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 cursor-pointer group">
            <h2 className="text-2xl font-bold text-white tracking-tight">{monthName} {dayName}</h2>
            <ChevronDown size={20} className="text-gray-400 group-hover:text-gray-200 mt-1 transition" />
          </div>
          <button
            onClick={syncCalendar}
            className="flex items-center gap-1.5 text-sm font-medium text-teal-300 bg-teal-500/20 border border-teal-500/30 px-4 py-1.5 rounded-full shadow-sm hover:bg-teal-500/30 transition">
            <span>{isSyncing ? "Syncing..." : "Sync"}</span>
            <RefreshCcw size={14} className={isSyncing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Weekly Calendar */}
        <div className="flex justify-between items-center mb-8 px-1">
          {weekDates.map((d, i) => {
            const isActive = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
            const dayStr = d.toLocaleString('default', { weekday: 'short' });
            return (
              <div
                key={i}
                onClick={() => setSelectedDate(new Date(d))}
                className={`flex flex-col items-center justify-center w-[52px] h-[76px] rounded-[24px] transition-all cursor-pointer ${isActive ? 'bg-gradient-to-br from-primaryTeal to-secondaryCyan text-white shadow-lg shadow-teal-500/40 transform scale-105 border border-white/20' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                <span className={`text-[11px] font-medium mb-1 ${isActive ? 'text-teal-50' : 'text-gray-400'}`}>{dayStr}</span>
                <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-200'}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>



        {/* Task List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] text-white font-bold tracking-wide">
                {selectedDate.toDateString() === new Date().toDateString() ? "Today" : "Scheduled"}
              </h3>
              <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] font-bold text-teal-300 border border-teal-500/30">
                {tasks.filter(t => !t.completed).length}
              </div>
              {/* Expired badge count */}
              {expiredIds.size > 0 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400">{expiredIds.size} expired</span>
                </div>
              )}
            </div>
            <MoreHorizontal size={20} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
          </div>

          {fetchError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium text-center animate-pulse">
              {fetchError}
            </div>
          )}

          <div className="space-y-0">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {tasks.filter(t => !t.completed).map((task, index) => {
                      const id = task._id || task.id;
                      const isExpired    = expiredIds.has(id);
                      const isRescheduled = rescheduledIds.has(id);

                      return (
                        <Draggable key={id} draggableId={String(id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`relative group ${snapshot.isDragging ? 'shadow-2xl shadow-indigo-500/20 scale-[1.02] z-50' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style, transition: snapshot.isDragging ? 'none' : 'all 0.2s cubic-bezier(0.2, 0, 0, 1)' }}
                            >
                                <TaskItem
                                title={task.title}
                                time={formatTime12Hour(task.time || task.startTime)}
                                priority={task.priority}
                                status={task.status}
                                icon={Briefcase}
                                isExpired={isExpired}
                                isRescheduled={isRescheduled}
                                onReschedule={() => rescheduleTask(task)}
                                onComplete={() => completeTask(id)}
                                onDelete={() => deleteTask(id)}
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

            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-8 opacity-60">
                <p className="text-sm text-gray-400 italic px-2 bg-white/5 rounded-2xl py-4 border border-white/10 shadow-inner">No tasks available for this date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Add Task & Missed Tasks side-by-side */}
        <div className="grid lg:grid-cols-2 gap-6 mt-2 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          {/* Add Task widget */}
          <GlassCard className="p-5 flex flex-col gap-4 bg-white/5 border-white/10 relative z-20 h-full">
            <h3 className="text-sm font-black uppercase tracking-widest text-teal-400 flex items-center gap-2">
              <Plus size={16} /> Add New Task
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-500/10">
                <Plus size={22} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1 bg-white/5 rounded-xl border border-white/10 outline-none text-[15px] font-medium text-white px-4 py-3 placeholder:text-gray-500 focus:border-teal-500/50 transition-all shadow-inner"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="relative flex-1">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:text-white outline-none focus:border-teal-500/50 transition-all cursor-pointer"
                  title="Start Time"
                />
              </div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:text-white outline-none focus:border-teal-500/50 transition-all cursor-pointer appearance-none text-center min-w-[100px]"
                title="Priority"
              >
                <option value="High"   className="bg-slate-900 text-red-400">🔥 High</option>
                <option value="Medium" className="bg-slate-900 text-amber-400">⚡ Med</option>
                <option value="Low"    className="bg-slate-900 text-emerald-400">🌱 Low</option>
              </select>
              <button
                onClick={addTask}
                className="bg-gradient-to-r from-secondaryCyan to-primaryTeal text-white font-black px-8 py-2.5 rounded-xl text-sm shadow-xl shadow-teal-500/30 hover:scale-[1.05] hover:brightness-110 active:scale-95 transition-all"
              >
                Add Task
              </button>
            </div>
          </GlassCard>

          {/* Missed & Reschedule Section */}
          <GlassCard className="p-5 flex flex-col gap-4 bg-white/5 border-white/10 relative z-20 h-full overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                <CalendarClock size={16} /> Missed & Reschedule
              </h3>
              <div className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-400">
                {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).length} Needed
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1 custom-scrollbar">
              {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).map(task => (
                <div key={task._id || task.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group/item">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-200 truncate group-hover/item:text-white transition-colors capitalize">{task.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{formatTime12Hour(task.startTime)}</p>
                  </div>
                  <button 
                    onClick={() => rescheduleTask(task)}
                    className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/10 active:scale-90"
                    title="Reschedule to next free slot"
                  >
                    <RefreshCcw size={14} className="hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              ))}
              
              {tasks.filter(t => !t.completed && expiredIds.has(t._id || t.id)).length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-4 opacity-40">
                  <CheckCircle size={24} className="text-emerald-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-400 italic">No missed tasks. Great job!</p>
                </div>
              )}
            </div>
            
            {/* Subtle background glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
