import React, { useState, useEffect } from "react";
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  ChevronRight, 
  Activity, 
  Flame, 
  Target, 
  Trophy,
  Zap,
  Star,
  CheckCircle2,
  Brain,
  Clock,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import maleAvatar from "../assets/avatars/male_avatar.svg";
import femaleAvatar from "../assets/avatars/female_avatar.svg";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, summaryRes, tasksRes] = await Promise.all([
          API.get("/auth/profile"),
          API.get("/intelligence/summary"),
          API.get("/tasks?limit=500")
        ]);
        setUser(userRes.data.user || userRes.data);
        setSummary(summaryRes.data);
        setAllTasks(tasksRes.data.tasks || []);
      } catch (err) {
        console.error("Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await API.delete("/auth/profile");
      localStorage.removeItem("token");
      setToast("Account and all associated data have been permanently removed.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Delete Account Error:", err);
      setToast("Failed to delete account. System interference detected.");
      setIsDeleting(false);
    }
  };

  const handleUpgrade = async () => {
    setIsSyncing(true);
    setToast("Initiating Pro Synchronization... Analyzing operational nodes.");
    
    try {
      const res = await API.get("/intelligence/summary");
      setSummary(res.data);
      
      setTimeout(() => {
        setSyncResults({
          completed: res.data.completed,
          pending: res.data.pending,
          missing: res.data.overdue
        });
        setIsSyncing(false);
        setToast("Synchronization Complete. Task matrix classified.");
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsSyncing(false);
      setToast("Synchronization failed. Check system connection.");
    }
  };

  const getMilestoneIcon = (iconName) => {
    switch(iconName) {
      case 'Flame': return <Flame className="text-lime-500" size={20} />;
      case 'Zap': return <Zap className="text-lime-500" size={20} />;
      case 'Star': return <Star className="text-lime-500" size={20} />;
      default: return <Trophy className="text-lime-500" size={20} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
      <div className="w-10 h-10 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 p-4 sm:p-6 md:p-8 lg:p-12 text-white relative flex flex-col gap-8 md:gap-20 max-w-7xl mx-auto page-transition overflow-x-hidden">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card p-10 max-w-md w-full border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.1)]"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-8 mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-black text-white text-center mb-4 uppercase tracking-tight">Terminate Identity?</h2>
              <p className="text-xs text-gray-400 text-center leading-relaxed mb-10 font-bold uppercase tracking-widest">
                This action will permanently erase your user profile, task history, and intelligence reports. <span className="text-rose-500">This protocol cannot be reversed.</span>
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full py-4 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isDeleting ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Trash2 size={14} />}
                  Confirm Permanent Erasure
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  Abort Protocol
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-20 relative z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.8rem] sm:rounded-[2.5rem] bg-gradient-to-br from-lime-500/10 to-lime-600/10 flex items-center justify-center text-white shadow-2xl shadow-lime-500/10 border border-white/10 relative group overflow-hidden">
              <img 
                src={user?.gender?.toLowerCase() === 'female' ? femaleAvatar : maleAvatar} 
                alt="3D Avatar" 
                className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
              />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-2xl border-4 border-[#0a0c10] shadow-xl z-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">{user?.name || "User"}</h1>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-lime-500/60">Node Integrity: Fully Operational</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Terminate Session
          </div>
        </button>
      </header>

      <div className="grid grid-cols-12 gap-10 md:gap-20">
        {/* Main Operational Log Column */}
        <div className="col-span-12 lg:col-span-8 space-y-12">
          
          {/* Performance Matrix */}
          <div className="glass-card p-6 sm:p-10 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/5 rounded-full blur-[60px] -z-10 group-hover:bg-lime-500/10 transition-all" />

            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500">
                <Activity size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">System Performance Matrix</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Real-time Node Metrics</p>
              </div>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
               <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-3 sm:gap-4">
                   <div className="flex items-center justify-between">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed</p>
                    <CheckCircle2 size={14} className="text-lime-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{summary?.completed || 0}</p>
               </div>
               <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Streak</p>
                    <Flame size={14} className="text-lime-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-lime-500 tracking-tighter">{summary?.activeStreak || "0 Days"}</p>
               </div>
               <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency</p>
                    <Target size={14} className="text-lime-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{summary?.productivityScore || "0%"}</p>
               </div>
            </div>
          </div>

          {/* Completed Task Log */}
          <div className="glass-card p-4 sm:p-8 flex flex-col gap-4 sm:gap-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Personal Profile</h3>
              <div className="p-2 sm:p-3 rounded-xl bg-lime-500/10 text-lime-500 border border-lime-500/20">
                <User size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="flex items-center gap-4 mb-8 sm:mb-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500">
                <Clock size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Completed Operational Log</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Verification of finalized tasks</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {allTasks?.filter(t => t.completed).length === 0 ? (
                 <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No completed tasks logged in the matrix</p>
                 </div>
               ) : (
                 allTasks?.filter(t => t.completed).map((task, idx) => (
                   <div key={task._id || idx} className="flex items-center justify-between p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/[0.03] border border-white/5 group/item hover:bg-white/[0.06] transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
                         <span className="text-sm font-bold text-white group-hover/item:translate-x-1 transition-transform">{task.title}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                         {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           
           {/* Pro Synchronization */}
           <div className="glass-card p-5 sm:p-10 bg-gradient-to-br from-lime-500 to-lime-600 border-none shadow-2xl shadow-lime-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -z-10 group-hover:bg-white/20 transition-all" />
              {isSyncing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Analyzing Matrix...</span>
                   </div>
                </div>
              )}
 
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
                 <Zap size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-3 uppercase">Pro Dynamic Sync</h3>
              
              {!syncResults ? (
                <p className="text-xs text-white/70 font-bold leading-relaxed mb-8 uppercase tracking-widest">
                  Classify and optimize your operational nodes for maximum efficiency.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="text-center p-3 rounded-xl bg-black/10">
                      <p className="text-[8px] font-black text-white/60 uppercase tracking-tighter mb-1">Done</p>
                      <p className="text-xl font-black text-white">{syncResults.completed}</p>
                   </div>
                   <div className="text-center p-3 rounded-xl bg-black/10">
                      <p className="text-[8px] font-black text-white/60 uppercase tracking-tighter mb-1">Wait</p>
                      <p className="text-xl font-black text-white">{syncResults.pending}</p>
                   </div>
                   <div className="text-center p-3 rounded-xl bg-black/10">
                      <p className="text-[8px] font-black text-rose-200/60 uppercase tracking-tighter mb-1">Miss</p>
                      <p className="text-xl font-black text-rose-200">{syncResults.missing}</p>
                   </div>
                </div>
              )}

              <button 
                onClick={handleUpgrade}
                disabled={isSyncing}
                className="w-full py-4 bg-white text-lime-500 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {syncResults ? "Refresh Synchronization" : "Initiate Sync Protocol"}
              </button>
           </div>

           {/* Achievements */}
           <div className="glass-card p-5 sm:p-10 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Trophy size={14} className="text-lime-500" />
                   Achievements
                </h3>
              </div>
              <div className="space-y-4">
                 {(summary?.milestones || []).slice(0, 3).map((milestone, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-500">
                         {getMilestoneIcon(milestone.icon)}
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white uppercase tracking-tight">{milestone.label}</p>
                         <p className="text-[8px] font-bold text-gray-500 uppercase">{milestone.desc}</p>
                      </div>
                   </div>
                 ))}
                 {(!summary?.milestones || summary.milestones.length === 0) && (
                   <p className="text-center py-6 text-gray-600 text-[10px] font-black uppercase tracking-widest">No achievements yet</p>
                 )}
              </div>
           </div>

           {/* Danger Zone */}
           <div className="glass-card p-5 sm:p-10 border-rose-500/10 bg-rose-500/[0.02]">
              <h3 className="text-xs font-black text-rose-500/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Shield size={14} />
                 Terminal Protocol
              </h3>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed mb-8 uppercase tracking-widest">
                Deleting your account will permanently wipe all matrix data. This cannot be undone.
              </p>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-4 border border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                  Delete My Account
                </div>
              </button>
           </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;