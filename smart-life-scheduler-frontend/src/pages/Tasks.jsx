import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api";
import {
  ChevronLeft, ChevronRight, Menu, RefreshCcw, MoreHorizontal,
  Dumbbell, Briefcase, BookOpen, Trash2, Plus, SlidersHorizontal,
  ChevronDown, CheckCircle, Sparkles, Bot, CalendarClock, Bell, X,
  AlertCircle, Layout, Eye, Search, Lightbulb, BarChart3 as BarChartIcon,
  Timer, TrendingUp, BrainCircuit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import TaskItem from "../components/TaskItem";

// ─── Helpers ───────────────────────────────────────────────────────────────
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

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-slideUp">
      <div className="glass-card px-5 py-3 text-sm font-semibold text-amber-500 flex items-center gap-2">
        <Sparkles size={15} />
        {message}
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
  const notifiedRef  = useRef(new Set());
  const autoRescheduledRef = useRef(new Set());
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get("/tasks?limit=50");
      setTasks(res.data.tasks || []);
    } catch (err) { console.error(err); }
  }, []);

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
      setTitle(""); setStartTime("");
    } catch (err) { console.error(err); }
  };

  const completeTask = async (taskId) => {
    try {
      setTasks(tasks.filter(t => (t._id || t.id) !== taskId));
      await api.patch(`/tasks/${taskId}`, { completed: true });
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
      setToast(`Rescheduled to ${res.data.task.startTime}`);
    } catch (err) { console.error(err); }
    setPendingNotification(null);
  };

  const applyOptimization = async () => {
    if (expiredIds.size === 0) {
      setToast("No missed tasks to optimize!");
      return;
    }
    setIsOptimizing(true);
    try {
      // Reschedule all missed tasks concurrently
      const promises = Array.from(expiredIds).map(id => api.post(`/tasks/${id}/reschedule`));
      const results = await Promise.all(promises);
      
      const newTasksMap = new Map();
      results.forEach(res => {
        const t = res.data.task;
        newTasksMap.set(t._id || t.id, t);
      });

      // Update state
      setTasks(prev => prev.map(t => newTasksMap.has(t._id || t.id) ? newTasksMap.get(t._id || t.id) : t));
      setExpiredIds(new Set());
      setToast(`${results.length} tasks successfully optimized and rescheduled!`);
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

  return (
    <div className="min-h-screen bg-transparent pl-0 md:pl-[84px] pb-24 md:pb-0 text-white page-transition">
      
      {pendingNotification && <RescheduleNotification task={pendingNotification} onReschedule={rescheduleTask} onDismiss={() => setPendingNotification(null)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 relative z-10 w-full flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Today's Tasks</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Search size={20} />
             </div>
             <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <CheckCircle size={22} />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Main Task Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            
            {/* Date Scroller */}
            <div className="glass-card p-6 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
              {weekDates.map((d, i) => {
                const isActive = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
                const dStr = d.toLocaleString('default', { weekday: 'short' });
                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedDate(new Date(d))} 
                    className={`
                      flex flex-col items-center justify-center min-w-[65px] h-[85px] rounded-2xl transition-all cursor-pointer border
                      ${isActive 
                        ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'}
                    `}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>{dStr}</span>
                    <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{d.getDate()}</span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-amber-500 mt-2" />}
                  </div>
                );
              })}
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

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="tasks-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {tasks.filter(t => !t.completed).map((task, index) => {
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
                                    isExpired={expiredIds.has(id)}
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

                {/* Inline Add Task */}
                <div className="glass-card p-3 flex items-center gap-4 bg-white/[0.02] border-dashed border-white/10 hover:bg-white/[0.04] transition-all">
                  <div className="w-10 h-10 flex items-center justify-center text-gray-600"><Plus size={20} /></div>
                  <input 
                    type="text" 
                    placeholder="Quick add task..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && addTask()} 
                    className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-600 font-medium text-sm" 
                  />
                  <div onClick={addTask} className="p-2 text-gray-500 hover:text-amber-500 cursor-pointer transition-colors">
                    <Plus size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* AI Suggestion Widget */}
            <div className="glass-card p-6 border-amber-500/20 bg-amber-500/[0.03]">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                   <Bot size={20} />
                 </div>
                 <h3 className="text-sm font-bold tracking-widest uppercase">AI Suggestion</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-analytics-dim leading-relaxed font-medium">
                  You have <span className="text-white font-bold">{missedStat}</span> missed tasks today. We recommend rescheduling them to your afternoon peak focus period.
                </p>
                <button 
                  onClick={applyOptimization}
                  disabled={isOptimizing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isOptimizing ? <span className="animate-pulse">Optimizing...</span> : "Apply Optimization"}
                </button>
              </div>
            </div>

            {/* Performance Widget */}
            <div className="glass-card p-6">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase">
                    <TrendingUp size={18} className="text-emerald-400" />
                    Insights
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed</span>
                     <span className="text-lg font-black">{completedStat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Missed</span>
                     <span className="text-lg font-black text-rose-500">{missedStat}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                        <span className="text-2xl font-black text-amber-glow">{percentStat}%</span>
                     </div>
                     <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentStat}%` }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                     </div>
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
                    <h3 className="text-lg font-black text-white/90">Neural Coach</h3>
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
                    Hey! I've analyzed your recent tasks. Your completion rate is looking solid at <strong>{percentStat}%</strong> today. 
                    <br/><br/>
                    However, I noticed a trend where afternoon energy dips. Try scheduling heavy cognitive tasks before 1 PM and leave administrative work for later.
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20 relative z-10 flex items-center gap-3">
                 <input 
                   type="text" 
                   placeholder="Ask the coach for strategic advice..." 
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                 />
                 <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                   <ChevronRight size={20} />
                 </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
