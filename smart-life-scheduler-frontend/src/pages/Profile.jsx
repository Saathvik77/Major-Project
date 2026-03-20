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
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion } from "framer-motion";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, summaryRes] = await Promise.all([
          API.get("/auth/profile"),
          API.get("/intelligence/summary")
        ]);
        setUser(userRes.data);
        setSummary(summaryRes.data);
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

  const getMilestoneIcon = (iconName) => {
    switch(iconName) {
      case 'Flame': return <Flame className="text-orange-500" size={20} />;
      case 'Zap': return <Zap className="text-orange-500" size={20} />;
      case 'Star': return <Star className="text-orange-500" size={20} />;
      default: return <Trophy className="text-orange-500" size={20} />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]"><div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 text-white relative flex flex-col gap-12 max-w-7xl mx-auto page-transition overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/20 border border-white/10 relative group">
             <User size={36} strokeWidth={2.5} />
             <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-[#0a0c10] shadow-xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">{user?.name || "Operative"}</h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">System Security Clearance: L3</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all shadow-xl group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Terminate Session
          </div>
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Stats Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Operational Stats Grid */}
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -z-10" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Operational Stats</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed</p>
                    <CheckCircle2 size={16} className="text-orange-500" />
                  </div>
                  <p className="text-4xl font-black text-white tracking-tighter">{summary?.completed || 0}</p>
               </div>
               <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Streak</p>
                    <Flame size={16} className="text-orange-500" />
                  </div>
                  <p className="text-4xl font-black text-orange-500 tracking-tighter">{summary?.activeStreak || "0 Days"}</p>
               </div>
               <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency</p>
                    <Target size={16} className="text-orange-500" />
                  </div>
                  <p className="text-4xl font-black text-white tracking-tighter">{summary?.productivityScore || "0%"}</p>
               </div>
            </div>
          </div>

          {/* Smart Milestones */}
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -z-10" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Smart Milestones</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">System Achievements</p>
              </div>
            </div>

            <div className="space-y-4">
               {(summary?.milestones || []).map((milestone, idx) => (
                 <div key={idx} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all group/item">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/5">
                       {getMilestoneIcon(milestone.icon)}
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">{milestone.label}</h4>
                       <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">{milestone.desc}</p>
                    </div>
                    <div className="ml-auto p-3 bg-white/5 rounded-xl text-gray-700 group-hover/item:text-orange-500 transition-colors">
                       <ChevronRight size={16} />
                    </div>
                 </div>
               ))}
               
               {(!summary?.milestones || summary.milestones.length === 0) && (
                 <p className="text-center py-10 text-gray-500 font-bold text-sm">Complete tasks to unlock milestones</p>
               )}
            </div>
          </div>
        </div>

        {/* Settings Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass-card p-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">System Settings</h3>
              <div className="space-y-2">
                 <SettingItem icon={Settings} label="Interface Calibration" />
                 <SettingItem icon={Shield} label="Security Protocol" />
                 <SettingItem icon={Bell} label="Notification Feed" />
                 <SettingItem icon={Activity} label="Data Management" />
              </div>
           </div>

           <div className="glass-card p-10 bg-gradient-to-br from-orange-500 to-amber-600 border-none shadow-2xl shadow-orange-500/20">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
                 <Zap size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-3 uppercase">Pro Synchronization</h3>
              <p className="text-xs text-white/70 font-bold leading-relaxed mb-8 uppercase tracking-widest">
                Unlock advanced AI modeling and multi-device cloud sync.
              </p>
              <button className="w-full py-4 bg-white text-orange-500 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">
                Upgrade Node
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

const SettingItem = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="text-gray-500 group-hover:text-orange-500 transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-[11px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">{label}</span>
    </div>
    <ChevronRight size={14} className="text-gray-800 group-hover:text-white transition-all" />
  </div>
);

export default Profile;