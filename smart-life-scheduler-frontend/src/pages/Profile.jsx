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
  X, 
  Loader2, 
  ShieldCheck, 
  Database, 
  CloudLightning,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";

// ─── Upgrade Modal Component ─────────────────────────────────────────
const UpgradeModal = ({ step, onClose }) => {
  const steps = [
    { label: "Verifying Node Integrity", icon: ShieldCheck, color: "text-blue-400" },
    { label: "Synchronizing Data Matrix", icon: Database, color: "text-amber-400" },
    { label: "Activating AI Core L4", icon: Brain, color: "text-purple-400" },
    { label: "Finalizing PRO Synchronization", icon: CloudLightning, color: "text-emerald-400" }
  ];

  const progress = (step / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 relative overflow-hidden border border-white/10 bg-[#0a0c10]/90"
      >
        {/* Glow FX */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 animate-pulse" />
        
        <div className="flex flex-col items-center text-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500 relative">
             <RefreshCcw size={40} className="animate-spin" strokeWidth={1.5} />
             <div className="absolute inset-0 bg-orange-500/20 blur-2xl -z-10 rounded-full animate-pulse" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-2">Upgrade in Progress</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Synchronizing Secure Operational Node</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 transition={{ duration: 0.5 }}
               />
            </div>
            <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest">
               <span>System Progress</span>
               <span className="text-orange-500">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Step Log */}
          <div className="w-full space-y-3 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
             {steps.map((s, idx) => {
               const Icon = s.icon;
               const isActive = step > idx;
               const isCurrent = step === idx + 1;
               return (
                 <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isActive || isCurrent ? 'opacity-100' : 'opacity-20'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isCurrent ? 'bg-orange-500/20 border-orange-500 animate-pulse' : isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                       {isActive ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Icon size={14} className={isCurrent ? 'text-orange-500' : 'text-gray-500'} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                 </div>
               );
             })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStep, setUpgradeProtocol] = useState(0);
  const [isPro, setIsPro] = useState(localStorage.getItem('isPro') === 'true');

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
    localStorage.removeItem("isPro");
    navigate("/login");
  };

  const handleUpgrade = () => {
    if (isPro) {
      setToast("Your operational node is already at PRO level. All synchronization protocols are active! ⚡");
      return;
    }

    setIsUpgrading(true);
    setUpgradeProtocol(1);
    
    // ─── Cinematic Upgrade Protocol Sequence ──────────────────────────
    setTimeout(() => setUpgradeProtocol(2), 1500);
    setTimeout(() => setUpgradeProtocol(3), 3000);
    setTimeout(() => setUpgradeProtocol(4), 4500);
    setTimeout(() => {
      setIsPro(true);
      setIsUpgrading(false);
      localStorage.setItem('isPro', 'true');
      setToast("Node Upgrade Successful! You are now a PRO OPERATIVE. 🚀✨");
    }, 6000);
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
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        {isUpgrading && <UpgradeModal step={upgradeStep} />}
      </AnimatePresence>
      {/* Background Glows */}
      <div className={`fixed top-[-10%] right-[-5%] w-[500px] h-[500px] ${isPro ? 'bg-amber-500/10' : 'bg-orange-500/5'} rounded-full blur-[120px] -z-10 transition-colors duration-1000`} />
      <div className={`fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] ${isPro ? 'bg-amber-500/10' : 'bg-orange-500/5'} rounded-full blur-[120px] -z-10 transition-colors duration-1000`} />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-[2.5rem] bg-gradient-to-br ${isPro ? 'from-amber-400 to-orange-600 shadow-amber-500/40' : 'from-orange-500 to-amber-600 shadow-orange-500/20'} flex items-center justify-center text-white shadow-2xl border border-white/10 relative group transition-all duration-1000`}>
             <User size={36} strokeWidth={2.5} />
             {isPro && (
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute -top-2 -right-2 bg-amber-400 text-[#0a0c10] text-[8px] font-black px-2 py-1 rounded-lg shadow-xl uppercase tracking-tighter"
               >
                 PRO
               </motion.div>
             )}
             <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-[#0a0c10] shadow-xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
              {user?.name || "Operative"}
              {isPro && <Sparkles size={24} className="text-amber-400 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">
              {isPro ? "System Security Clearance: PRO OPERATIVE" : "System Security Clearance: L3"}
            </p>
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

           <div className={`glass-card p-10 bg-gradient-to-br ${isPro ? 'from-amber-400 to-orange-600 shadow-amber-500/20' : 'from-orange-500 to-amber-600 shadow-orange-500/20'} border-none shadow-2xl transition-all duration-1000`}>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
                 {isPro ? <Trophy size={24} strokeWidth={2.5} /> : <Zap size={24} strokeWidth={2.5} />}
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-3 uppercase">
                {isPro ? "Node Fully Optimized" : "Pro Synchronization"}
              </h3>
              <p className="text-xs text-white/70 font-bold leading-relaxed mb-8 uppercase tracking-widest">
                {isPro 
                  ? "Advanced AI modeling and multi-device cloud sync are now active on your node." 
                  : "Unlock advanced AI modeling and multi-device cloud sync."}
              </p>
              <button 
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className={`w-full py-4 ${isPro ? 'bg-[#0a0c10] text-amber-400 cursor-default' : 'bg-white text-orange-500 hover:scale-105'} font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3`}
              >
                {isUpgrading ? (
                  <>
                    <RefreshCcw size={14} className="animate-spin" />
                    Synchronizing...
                  </>
                ) : isPro ? (
                  <>
                    <Shield size={14} />
                    PRO ACTIVE
                  </>
                ) : (
                  "Upgrade Node"
                )}
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