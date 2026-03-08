import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Dumbbell, Activity, LogOut, ChevronLeft, Check, Camera } from "lucide-react";
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
        // Map backend values, fallback to empty strings if null
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
      
      // Clear message after 3 seconds
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
      // Force logout anyway if the network request fails
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen pb-28 font-sans relative overflow-x-hidden text-white flex flex-col items-center">
      {/* Background gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 animate-floatGlow"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-primaryTeal/20 rounded-full blur-[100px] -z-10 animate-floatGlow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md pt-8 px-6 relative z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition text-white shadow-lg">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold tracking-widest uppercase">Profile</h1>
          <button onClick={handleLogout} className="p-2 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition text-red-400 shadow-lg">
            <LogOut size={20} />
          </button>
        </div>

        {/* Profile Avatar Header */}
        <div className="flex flex-col items-center mb-8 animate-fadeIn">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primaryTeal to-indigo-500 p-1 shadow-xl shadow-teal-500/20 mb-4">
              <div className="w-full h-full rounded-full bg-slate-900 border-4 border-slate-900 flex items-center justify-center overflow-hidden relative">
                 <User size={48} className="text-gray-400" />
                 
                 {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:bg-black/60 transition-colors backdrop-blur-[2px]">
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    </div>
                 )}
              </div>
            </div>
            
            {!isEditing && (
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">{user.name || "Loading..."}</h2>
                <p className="text-teal-300 font-medium text-sm mt-1">{user.email || ""}</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Toggle & Status Message */}
        <div className="flex justify-between items-end mb-4 px-1 min-h-[32px]">
          <div>
            {message.text && (
              <p className={`text-sm font-medium px-3 py-1 rounded-full ${message.type === 'success' ? 'bg-teal-500/20 text-teal-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
              </p>
            )}
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="text-sm font-bold text-teal-300 bg-teal-500/10 px-4 py-1.5 rounded-full border border-teal-500/20 hover:bg-teal-500/20 transition flex items-center gap-2 ml-auto"
          >
            {isEditing ? (
              <>
                <Check size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </>
            ) : "Edit Profile"}
          </button>
        </div>

        {/* Form Fields Container */}
        <GlassCard className="flex flex-col gap-5 p-6 mb-8 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
          
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
              <User size={14} className="text-teal-400" />
              Full Name
            </label>
            <input 
              type="text" 
              name="name"
              value={user.name} 
              onChange={handleChange}
              disabled={!isEditing}
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:px-0 font-medium transition-all"
            />
          </div>

          {/* Email (Always Disabled) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-teal-400" />
              Email Address
            </label>
            <input 
              type="email" 
              value={user.email} 
              disabled
              className="bg-transparent border border-transparent rounded-xl py-3 text-white opacity-60 font-medium"
            />
          </div>

          <div className="h-px bg-white/10 w-full my-1"></div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
              <Phone size={14} className="text-teal-400" />
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phno"
              value={user.phno} 
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? "e.g. +1 234 567 8900" : "Not set"}
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:px-0 font-medium transition-all"
            />
          </div>

          {/* Age, Weight, Gender Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                <Calendar size={14} className="text-teal-400" />
                Age
              </label>
              <input 
                type="number" 
                name="age"
                value={user.age} 
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={isEditing ? "Age" : "-"}
                className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:px-0 font-medium transition-all"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                <Activity size={14} className="text-teal-400" />
                Weight (kg)
              </label>
              <input 
                type="number" 
                name="weight"
                value={user.weight} 
                onChange={handleChange}
                disabled={!isEditing}
                placeholder={isEditing ? "kg" : "-"}
                className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 disabled:opacity-70 disabled:bg-transparent disabled:border-transparent disabled:px-0 font-medium transition-all"
              />
            </div>
            
            {/* Gender */}
            <div className="flex flex-col gap-1.5 col-span-2 mt-2">
              <label className="text-[12px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                <Dumbbell size={14} className="text-teal-400" />
                Gender
              </label>
              {isEditing ? (
                <select 
                  name="gender" 
                  value={user.gender} 
                  onChange={handleChange}
                  className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 font-medium appearance-none"
                >
                  <option value="" className="bg-slate-900 text-gray-400">Select...</option>
                  <option value="Male" className="bg-slate-900">Male</option>
                  <option value="Female" className="bg-slate-900">Female</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  value={user.gender} 
                  disabled
                  placeholder="-"
                  className="bg-transparent border border-transparent rounded-xl py-3 text-white opacity-70 font-medium"
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
