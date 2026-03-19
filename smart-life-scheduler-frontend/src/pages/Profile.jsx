import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  User, 
  Camera, 
  Shield, 
  BadgeCheck, 
  LogOut, 
  Check, 
  Mail, 
  Calendar, 
  Dumbbell, 
  Phone,
  Trophy,
  Flame,
  Zap,
  Target,
  Activity,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";

const AchievementBadge = ({ icon: Icon, label, desc }) => (
  <div className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all group">
    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-black text-white tracking-tight">{label}</p>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{desc}</p>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    phno: "",
    gender: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        if (res.data.user) setUser(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/auth/profile", user);
      setIsEditing(false);
      setToast("Identity synchronized successfully");
    } catch (err) {
      console.error(err);
      setToast("Sync failed. Retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 text-white relative flex flex-col gap-12 max-w-7xl mx-auto page-transition">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
      {/* Lighting FX */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Smart Identity</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">Core Profile Configuration</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3.5 bg-rose-500/10 backdrop-blur-xl rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all text-rose-400 shadow-xl group">
          <LogOut size={22} className="group-hover:scale-110 transition-transform" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Main Profile Card ───────────────────────────────────── */}
        <div className="lg:col-span-8 glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-10" />
          
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group cursor-pointer mb-8">
                <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-orange-400 via-orange-500 to-rose-500 p-1 blur-sm opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-40 h-40 rounded-full bg-slate-900 border-4 border-[#0a0c10] flex items-center justify-center overflow-hidden relative z-10 shadow-2xl">
                  <User size={72} className="text-gray-700" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px] transition-all">
                      <Camera size={28} className="text-white mb-1" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 z-20 bg-orange-500 rounded-full p-2 border-4 border-[#0a0c10] shadow-lg">
                  <BadgeCheck size={20} className="text-white" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-white">{user.name || "Smart User"}</h2>
                <div className="flex items-center justify-center gap-2 mt-3 bg-white/5 px-5 py-2 rounded-full border border-white/10">
                  <Shield size={14} className="text-orange-500" />
                  <p className="text-gray-400 font-bold text-[10px] tracking-[0.2em] uppercase">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 w-full space-y-10">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Smart Parameters</h3>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all border shadow-lg ripple ${isEditing
                    ? 'bg-orange-500 text-white border-transparent hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-orange-500 border-orange-500/20 hover:bg-orange-500/10'
                  }`}
                >
                  {isEditing ? (isSaving ? "Syncing..." : "Commit Data") : "Modify Identity"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Assigned Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Communication Link</label>
                  <input
                    type="text"
                    name="phno"
                    value={user.phno}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Temporal Age</label>
                  <input
                    type="number"
                    name="age"
                    value={user.age}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Mass Metric (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={user.weight}
                    disabled={!isEditing}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-orange-500/50 disabled:opacity-50 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Stats & Achievements ──────────────────── */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Quick Performance Stats */}
          <div className="glass-card p-8 flex flex-col gap-6">
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-orange-500" />
                Operational Stats
             </h3>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Completed</p>
                      <p className="text-2xl font-black text-white">124</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Check size={20} />
                   </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Active Streak</p>
                      <p className="text-2xl font-black text-orange-500">7 Days</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Flame size={20} />
                   </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Efficiency</p>
                      <p className="text-2xl font-black text-white">88%</p>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <Target size={20} />
                   </div>
                </div>
             </div>
          </div>

          {/* Achievements Section */}
          <div className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] -z-10 group-hover:bg-orange-500/10 transition-all" />
             <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Trophy size={14} className="text-orange-500" />
                Smart Milestones
             </h3>
             <div className="space-y-3">
                <AchievementBadge icon={Flame} label="Focus Master" desc="7 Day Streak Achieved" />
                <AchievementBadge icon={Zap} label="Peak Sync" desc="100% Daily Efficiency" />
                <AchievementBadge icon={Star} label="System Veteran" desc="100+ Tasks Logged" />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;