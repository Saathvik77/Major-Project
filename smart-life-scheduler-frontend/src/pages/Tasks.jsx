import { useState, useEffect } from "react";
import api from "../api";
import { ChevronLeft, ChevronRight, Menu, RefreshCcw, MoreHorizontal, Dumbbell, Briefcase, BookOpen, Trash2, Plus, SlidersHorizontal, ChevronDown, CheckCircle, Sparkles, Bot } from "lucide-react";
import BottomNav from "../components/BottomNav";
import GlassCard from "../components/GlassCard";
import TaskItem from "../components/TaskItem";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiSchedule, setAiSchedule] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks?limit=50");
      let fetchedTasks = res.data.tasks || [];

      // Load saved order from localStorage
      const dateKey = `task-order-${selectedDate.toDateString()}`;
      const savedOrderStr = localStorage.getItem(dateKey);

      if (savedOrderStr) {
        try {
          const savedOrder = JSON.parse(savedOrderStr);
          // Sort fetchedTasks based on savedOrder array of IDs
          fetchedTasks.sort((a, b) => {
            const idA = a._id || a.id;
            const idB = b._id || b.id;
            const indexA = savedOrder.indexOf(idA);
            const indexB = savedOrder.indexOf(idB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0; // Keep original order for new tasks not in savedOrder
          });
        } catch (e) {
          console.error(e);
        }
      }

      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Listen for tasks added/deleted by the AI Coach
    window.addEventListener("tasksUpdated", fetchTasks);
    return () => window.removeEventListener("tasksUpdated", fetchTasks);
  }, []);

  useEffect(() => {
    fetchTasks(); // Refetch/Resort when selected Date changes
  }, [selectedDate]);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/tasks", {
        title,
        description: "General task",
        date: selectedDate, // Bind to the currently selected calendar date
        duration: 60,
        priority: priority,
        deadline: selectedDate,
        startTime: startTime || "09:00"
      });
      setTasks([...tasks, res.data.task]);
      setTitle("");
      setStartTime("");
      setPriority("Medium");

      // Play success alarm chime
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(e => console.error("Audio playback error:", e));

    } catch (err) {
      console.error("Add task error:", err.response?.data || err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Optimiztic UI update
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error("Delete task error:", err.response?.data || err);
      // Revert if error
      fetchTasks();
    }
  };

  const completeTask = async (taskId) => {
    try {
      // Optimistic UI update: Remove from this view
      setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));
      await api.patch(`/tasks/${taskId}`, { completed: true });

      // Dispatch event to update Analytics tab's completed tasks
      window.dispatchEvent(new Event("tasksUpdated"));

      // Play success chime
      const audio = new Audio('/success-chime.mp3');
      audio.play().catch(e => console.error("Audio playback error:", e));
    } catch (err) {
      console.error("Complete task error:", err.response?.data || err);
      fetchTasks();
    }
  };

  const syncCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      fetchTasks();
      setIsSyncing(false);
    }, 1000);
  };

  const generateMyDay = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post("/tasks/generate-schedule");
      setAiSchedule(res.data.schedule);
    } catch (err) {
      console.error("Failed to generate schedule", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Isolate active (uncompleted) tasks since we only render and drag those
    const activeTasks = tasks.filter(t => !t.completed);

    // Copy active array and reorder
    const updatedActiveTasks = Array.from(activeTasks);
    const [reorderedItem] = updatedActiveTasks.splice(sourceIndex, 1);
    updatedActiveTasks.splice(destIndex, 0, reorderedItem);

    // Reconstruct full tasks array (keeping completed implicitly at the end or hidden)
    const completedTasks = tasks.filter(t => t.completed);
    const newFullTasks = [...updatedActiveTasks, ...completedTasks];

    setTasks(newFullTasks);

    // Persist active tasks order to localStorage for this specific Date
    const orderedIds = updatedActiveTasks.map(t => t._id || t.id);
    const dateKey = `task-order-${selectedDate.toDateString()}`;
    localStorage.setItem(dateKey, JSON.stringify(orderedIds));
  };

  // Generate a dynamic week based on the selected date
  const generateWeek = (baseDate) => {
    const week = [];
    const current = new Date(baseDate);
    current.setDate(current.getDate() - 3); // Start 3 days before selected

    for (let i = 0; i < 6; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return week;
  };

  const weekDates = generateWeek(selectedDate);
  const monthName = selectedDate.toLocaleString('default', { month: 'short' });
  const dayName = selectedDate.getDate();

  const handleDateSelect = (date) => {
    setSelectedDate(new Date(date));
  };

  const getDayProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // 12-Hour Time Formatter
  const formatTime12Hour = (time24) => {
    if (!time24) return "Anytime";
    const [hours24, minutes] = time24.split(":");
    if (!hours24 || !minutes) return time24;

    const h = parseInt(hours24, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const hours12 = ((h + 11) % 12 + 1).toString().padStart(2, '0');
    return `${hours12}:${minutes} ${suffix}`;
  };

  return (
    <div className="min-h-screen pb-28 font-sans relative overflow-x-hidden text-white">
      {/* Dynamic Background Accents */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] left-[60%] w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-md mx-auto pt-8 px-6 relative z-10">
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
                onClick={() => handleDateSelect(d)}
                className={`flex flex-col items-center justify-center w-[52px] h-[76px] rounded-[24px] transition-all cursor-pointer ${isActive ? 'bg-gradient-to-br from-primaryTeal to-secondaryCyan text-white shadow-lg shadow-teal-500/40 transform scale-105 border border-white/20' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                <span className={`text-[11px] font-medium mb-1 ${isActive ? 'text-teal-50' : 'text-gray-400'}`}>{dayStr}</span>
                <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-200'}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* AI Generated Plan Section */}
        {selectedDate.toDateString() === new Date().toDateString() && (
          <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <GlassCard className="p-5 flex flex-col gap-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20 relative z-20 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-[17px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-400" />
                  AI Generated Plan for Today
                </h3>
              </div>

              {aiSchedule ? (
                <div className="space-y-3 mt-2 relative z-10">
                  {aiSchedule.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="text-sm font-semibold text-indigo-300 whitespace-nowrap min-w-[95px]">
                        {item.timeRange}
                      </div>
                      <div className="text-sm font-medium text-gray-200">
                        {item.title}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setAiSchedule(null)}
                    className="w-full mt-2 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Plan
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateMyDay}
                  disabled={isGenerating || tasks.filter(t => !t.completed && new Date(t.date).toDateString() === new Date().toDateString()).length === 0}
                  className="relative group w-full overflow-hidden rounded-xl bg-white/5 border border-indigo-500/30 p-4 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold text-indigo-200 tracking-wide">
                    {isGenerating ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin text-indigo-400" />
                        Generating Your Schedule...
                      </>
                    ) : (
                      <>
                        <Bot size={18} className="text-indigo-400" />
                        Generate My Day
                      </>
                    )}
                  </span>
                </button>
              )}
            </GlassCard>
          </div>
        )}

        {/* Today section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] text-white font-bold tracking-wide">
                {selectedDate.toDateString() === new Date().toDateString() ? "Today" : "Scheduled"}
              </h3>
              <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] font-bold text-teal-300 border border-teal-500/30">
                {tasks.length || 0}
              </div>
            </div>
            <MoreHorizontal size={20} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
          </div>

          <div className="space-y-0">
            {/* Real tasks from DB - Drag and Drop Container */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {tasks.filter(t => !t.completed).map((task, index) => (
                      <Draggable key={task._id || task.id} draggableId={task._id || task.id} index={index}>
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
                            />
                            <div className="absolute right-0 top-0 bottom-0 pr-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20 pointer-events-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeTask(task._id || task.id);
                                }}
                                className="text-emerald-500 hover:text-emerald-400 hover:scale-110 active:scale-95 transition-transform bg-black/40 rounded-full p-1 border border-white/5 backdrop-blur-sm"
                                title="Mark as Done"
                              >
                                <CheckCircle size={22} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task._id || task.id);
                                }}
                                className="text-red-500 hover:text-red-400 hover:scale-110 active:scale-95 transition-transform bg-black/40 rounded-full p-1 border border-white/5 backdrop-blur-sm"
                                title="Delete Task"
                              >
                                <Trash2 size={22} className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* If no real tasks, show a message */}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-8 opacity-60">
                <p className="text-sm text-gray-400 italic px-2 bg-white/5 rounded-2xl py-4 border border-white/10 shadow-inner">No tasks available for this date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Task input widget */}
        <div className="mt-2 mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <GlassCard className="p-3 flex flex-col gap-3 bg-white/5 border-white/10 relative z-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300 ml-1 border border-teal-500/30">
                <Plus size={20} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Add a new task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-white px-2 placeholder:text-gray-500 focus:ring-0"
              />
            </div>

            <div className="flex items-center justify-between pl-1">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:text-white outline-none focus:border-teal-500/50 transition-colors"
                title="Start Time"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:text-white outline-none focus:border-teal-500/50 transition-colors cursor-pointer appearance-none text-center"
                title="Priority"
              >
                <option value="High" className="bg-slate-800 text-red-400">High</option>
                <option value="Medium" className="bg-slate-800 text-amber-400">Med</option>
                <option value="Low" className="bg-slate-800 text-emerald-400">Low</option>
              </select>
              <button
                onClick={addTask}
                className="bg-gradient-to-r from-secondaryCyan to-primaryTeal text-white font-bold px-6 py-2.5 rounded-[20px] text-sm shadow-md shadow-teal-500/30 hover:scale-[1.02] transition-transform active:scale-95"
              >
                Add Task
              </button>
            </div>
          </GlassCard>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
