import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  Target, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Brain,
  Zap,
  Calendar,
  AlertCircle
} from "lucide-react";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals");
      setGoals(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    setIsCreating(true);
    try {
      await api.post("/goals", { title: newGoal });
      setNewGoal("");
      fetchGoals();
      setIsCreating(false);
    } catch (err) {
      setError("Failed to create goal");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Goal Execution Engine
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Turn your long-term visions into daily victories.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm flex items-center gap-2">
              <Zap className="text-yellow-400 w-5 h-5" />
              <span className="text-sm font-medium">Sync Active</span>
            </div>
          </div>
        </header>

        {/* Create Goal Section */}
        <section className="mb-12">
          <form onSubmit={handleCreateGoal} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4 items-center">
              <Brain className="text-cyan-400 w-8 h-8" />
              <input 
                type="text" 
                placeholder="What do you want to achieve? (e.g., Learn AI in 3 months)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl text-white placeholder-slate-500"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                disabled={isCreating}
              />
              <button 
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isCreating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                Generate Roadmap
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
             [1,2].map(i => (
              <div key={i} className="h-64 bg-slate-800/20 animate-pulse rounded-2xl border border-slate-700/50"></div>
             ))
          ) : goals.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
              <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 text-xl font-medium">No active goals found. Start by dreaming big!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal._id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-500/20">
                    {goal.status}
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                    <Target className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{goal.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Target: {new Date(goal.targetDate || Date.now() + 90*24*60*60*1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 mb-8 line-clamp-2">
                  {goal.description || "The AI is crafting your strategic roadmap to success..."}
                </p>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-300">Completion Progress</span>
                    <span className="text-cyan-400 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Roadmap Preview */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Roadmap</h4>
                  {goal.roadmap?.slice(0, 3).map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                      <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                      <span className="text-sm flex-1 truncate">{step.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                  {goal.roadmap?.length > 3 && (
                    <button className="w-full text-center text-sm text-cyan-400 font-medium hover:underline pt-2">
                      View Full Roadmap ({goal.roadmap.length} steps)
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Row */}
        {!loading && goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Tasks Completed</div>
              </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Clock className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">142h</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Focus Invested</div>
              </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <TrendingUp className="text-cyan-500 w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold">84%</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Efficiency Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
