import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Dumbbell, Activity, LogOut, ChevronLeft, Check, Camera, Shield, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import GlassCard from "../components/GlassCard";
import BottomNav from "../components/BottomNav";

export default function Profile() {
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
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/profile");
      if (data.success && data.user) {
        setUser({
          name: data.user.name || "",
          email: data.user.email || "",
          age: data.user.age || "",
          weight: data.user.weight || "",
          phno: data.user.phno || "",
          gender: data.user.gender || "",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load profile data.", type: "error" });
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.put("/auth/profile", {
        name: user.name,
        age: user.age ? Number(user.age) : null,
        weight: user.weight ? Number(user.weight) : null,
        phno: user.phno,
        gender: user.gender
      });

      if (data.success) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen pb-32 font-sans relative overflow-x-hidden text-white flex flex-col items-center">
      {/* Background gradients */}
      <div className="fixed top-[-10%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-floatGlow pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] -z-10 animate-floatGlow pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] right-[-20%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10 animate-floatGlow pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md pt-8 px-6 relative z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-white shadow-lg focus:outline-none">
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase text-gray-200">Settings</h1>
          <button onClick={handleLogout} className="p-2.5 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-400 shadow-lg group focus:outline-none">
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Profile Avatar Header */}
        <div className="flex flex-col items-center mb-10 animate-slideUpFade">
          <div className="relative group cursor-pointer">
            {/* Animated Ring */}
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-1 blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_4s_linear_infinite]" />
            
            <div className="w-28 h-28 rounded-full bg-slate-900 border-4 border-slate-900 flex items-center justify-center overflow-hidden relative z-10 shadow-2xl">
               <User size={48} className="text-gray-400" />
               
               {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-[2px]">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                  </div>
               )}
            </div>

            {/* Verification Badge */}
            <div className="absolute bottom-0 right-0 z-20 bg-emerald-500 rounded-full p-1 border-2 border-slate-900 shadow-lg">
                <BadgeCheck size={16} className="text-white relative z-10" />
            </div>
          </div>
          
          {!isEditing && (
            <div className="text-center mt-5">
              <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">{user.name || "Loading..."}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-1 lg:mt-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 w-fit mx-auto">
                 <Shield size={12} className="text-cyan-400" />
                 <p className="text-cyan-200 font-semibold text-xs tracking-wide">{user.email || ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Edit Toggle & Status Message */}
        <div className="flex justify-between items-end mb-4 px-1 min-h-[36px]">
          <div className="flex-1 mr-4">
            {message.text && (
              <p className={`text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border animate-in slide-in-from-left-2 fade-in ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
              }`}>
                {message.text}
              </p>
            )}
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`text-sm font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-2 border shadow-lg shrink-0 outline-none ${
                isEditing 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent hover:scale-105 active:scale-95' 
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 active:scale-95'
            }`}
          >
            {isEditing ? (
              <>
                <Check size={16} className={isSaving ? "opacity-0" : ""} />
                {isSaving ? "Saving..." : "Save Profile"}
              </>
            ) : "Edit Details"}
          </button>
        </div>

        {/* Form Fields Container */}
        <GlassCard className="flex flex-col gap-6 p-7 mb-8 animate-slideUpFade shadow-2xl bg-white/[0.03] border-white/10 relative overflow-hidden" style={{ animationDelay: "0.1s" }}>
          
          {/* Internal Glows inside Card */}
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div>

          {/* Name */}
          <div className="flex flex-col gap-2 relative z-10 group">
            <label className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 ml-1">
              <User size={14} className="text-indigo-400 group-focus-within:text-cyan-400 transition-colors" />
              Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={user.name} 
              onChange={handleChange}
              disabled={!isEditing}
              className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 disabled:opacity-80 disabled:bg-transparent disabled:border-transparent disabled:px-1 disabled:py-2 font-semibold transition-all text-[15px] shadow-inner"
            />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-1"></div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2 relative z-10 group">
            <label className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 ml-1">
              <Phone size={14} className="text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phno"
              value={user.phno} 
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? "+1 234 567 8900" : "Number not linked"}
              className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 disabled:opacity-80 disabled:bg-transparent disabled:border-transparent disabled:px-1 disabled:py-2 font-semibold transition-all text-[15px] shadow-inner placeholder:text-gray-600"
            />
          </div>

          {/* Age, Weight, Gender Grid */}
          <div className="grid grid-cols-2 gap-5 mt-2 relative z-10">
            {/* Age */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={14} className="text-purple-400 group-focus-within:text-cyan-400 transition-colors" />
                Age
              </label>
              <input 
                type="number" 
                name="age"
                value={user.age} 
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={isEditing ? "25" : "—"}
                className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 disabled:opacity-80 disabled:bg-transparent disabled:border-transparent disabled:px-1 disabled:py-2 font-semibold transition-all text-[15px] shadow-inner placeholder:text-gray-600"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-2 group">
              <label className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 ml-1">
                <Activity size={14} className="text-emerald-400 group-focus-within:text-cyan-400 transition-colors" />
                Weight (kg)
              </label>
              <input 
                type="number" 
                name="weight"
                value={user.weight} 
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={isEditing ? "70" : "—"}
                className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 disabled:opacity-80 disabled:bg-transparent disabled:border-transparent disabled:px-1 disabled:py-2 font-semibold transition-all text-[15px] shadow-inner placeholder:text-gray-600"
              />
            </div>
            
            {/* Gender */}
            <div className="flex flex-col gap-2 col-span-2 mt-2 group">
              <label className="text-[11px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-2 ml-1">
                <Dumbbell size={14} className="text-pink-400 group-focus-within:text-cyan-400 transition-colors" />
                Gender Identity
              </label>
              {isEditing ? (
                <div className="relative">
                  <select 
                    name="gender" 
                    value={user.gender} 
                    onChange={handleChange}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 font-semibold transition-all text-[15px] shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-gray-400">Select...</option>
                    <option value="Male" className="bg-slate-900">Male</option>
                    <option value="Female" className="bg-slate-900">Female</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                     <ChevronLeft size={16} className="text-gray-400 -rotate-90" />
                  </div>
                </div>
              ) : (
                <input 
                  type="text" 
                  value={user.gender} 
                  disabled
                  placeholder="—"
                  className="bg-transparent border border-transparent rounded-2xl py-2 px-1 text-white opacity-80 font-semibold text-[15px]"
                />
              )}
            </div>
          </div>

        </GlassCard>
      </div>

      <BottomNav />
    </div>
  );
}

