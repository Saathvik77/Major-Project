import { useEffect, useState } from "react";
import { ChevronLeft, BrainCircuit, Activity, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import GlassCard from "../components/GlassCard";

export default function Reports() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks?limit=50");
        setTasks(res.data.tasks || []);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse">Analyzing user condition...</p>
      </div>
    );
  }

  // Calculate generic health metrics based on task ratio
  const completed = tasks.filter((t) => t.completed === true).length;
  const pending = tasks.filter((t) => t.completed === false).length;
  const total = tasks.length;
  
  let condition = "Neutral";
  let conditionColor = "text-gray-400";
  let conditionBg = "bg-gray-500/10 border-gray-500/20";
  let message = "Not enough data to determine your state. Keep adding tasks!";
  let icon = <BrainCircuit size={48} className="text-gray-400" />;

  if (total > 0) {
    const completionRate = completed / total;
    
    if (completionRate >= 0.8) {
      condition = "Excellent";
      conditionColor = "text-emerald-400";
      conditionBg = "bg-emerald-500/10 border-emerald-500/30";
      message = "You are operating at peak efficiency! Your task completion rate is outstanding. Keep up the momentum, but remember to take breaks.";
      icon = <Activity size={48} className="text-emerald-400" />;
    } else if (completionRate >= 0.5) {
      condition = "Stable";
      conditionColor = "text-cyan-400";
      conditionBg = "bg-cyan-500/10 border-cyan-500/30";
      message = "You are maintaining a steady pace. You're getting things done, but there's room to optimize your workflow and tackle those pending items.";
      icon = <HeartPulse size={48} className="text-cyan-400" />;
    } else {
      condition = "Overwhelmed";
      conditionColor = "text-red-400";
      conditionBg = "bg-red-500/10 border-red-500/30";
      message = "You have a large backlog of pending tasks. It might be time to reassess your workload, break tasks into smaller chunks, or delegate.";
      icon = <BrainCircuit size={48} className="text-red-400" />;
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 relative z-10 font-sans text-white max-w-4xl mx-auto">
      {/* Dynamic Background */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Health & Reports</h1>
      </div>

      <div className={`p-8 rounded-3xl backdrop-blur-md border shadow-2xl relative overflow-hidden transition-colors ${conditionBg}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
             {icon}
          </div>
          
          <div>
            <h2 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">Overall Condition</h2>
            <h3 className={`text-5xl font-black tracking-tight mb-4 ${conditionColor} drop-shadow-md`}>
              {condition}
            </h3>
            <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
              {message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 border-t border-white/10 pt-8">
           <div className="text-center">
             <p className="text-3xl font-bold text-white mb-1">{total}</p>
             <p className="text-xs text-gray-400 uppercase tracking-widest">Total Workload</p>
           </div>
           <div className="text-center border-l border-white/10">
             <p className="text-3xl font-bold text-emerald-400 mb-1">{completed}</p>
             <p className="text-xs text-gray-400 uppercase tracking-widest">Completed</p>
           </div>
           <div className="text-center border-l border-white/10">
             <p className="text-3xl font-bold text-amber-400 mb-1">{pending}</p>
             <p className="text-xs text-gray-400 uppercase tracking-widest">Pending</p>
           </div>
           <div className="text-center border-l border-white/10">
             <p className="text-3xl font-bold text-cyan-400 mb-1">
               {total > 0 ? Math.round((completed / total) * 100) : 0}%
             </p>
             <p className="text-xs text-gray-400 uppercase tracking-widest">Efficiency</p>
           </div>
        </div>
      </div>
    </div>
  );
}
