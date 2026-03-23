import React, { useState, useEffect, useContext } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Eye, 
  ChevronDown, 
  Settings as SettingsIcon,
  Shield,
  Trash2,
  LogOut,
  Zap,
  Moon,
  Volume2,
  Smartphone,
  Globe,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import Toast from "../components/Toast";
import { ThemeContext } from "../ThemeContext";

const Toggle = ({ active, onClick }) => (
  <div 
    onClick={onClick}
    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all shadow-lg ${active ? 'bg-orange-500 shadow-orange-500/20' : 'bg-white/10'}`}
  >
    <motion.div 
      initial={false}
      animate={{ x: active ? 26 : 4 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" 
    />
  </div>
);

const SettingsOption = ({ icon: Icon, title, desc, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-5 p-6 hover:bg-white/[0.04] cursor-pointer transition-colors"
      >
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/5">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{desc}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600 mr-2"
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/5 bg-white/[0.02]"
          >
            <div className="p-8 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Settings() {
  const navigate = useNavigate();
  const { isLightMode, toggleTheme } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-transparent pl-0 md:pl-[84px] pb-32 md:pb-10 p-4 md:p-8 lg:p-12 page-transition text-white max-w-7xl mx-auto overflow-y-auto overflow-x-hidden">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
      {/* Lighting FX */}
      <div className={`fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10 ${isLightMode ? 'opacity-0' : 'opacity-100'}`} />
      
      <div className="max-w-[900px] mx-auto relative z-10 w-full flex flex-col gap-12">
        
        <header className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30">
              <SettingsIcon size={32} strokeWidth={2} />
           </div>
           <div>
              <h1 className={`text-4xl font-black tracking-tighter ${isLightMode ? 'text-gray-900' : 'text-white'}`}>System Configuration</h1>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1 text-orange-500/60">Manage System Parameters</p>
           </div>
        </header>

        <div className="space-y-6">
          
          {/* Appearance Section */}
          <SettingsOption icon={Eye} title="Interface Aesthetics" desc="Theme & Lighting Environment" defaultOpen={true}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  {isLightMode ? <Sun size={18} className="text-orange-500" /> : <Moon size={18} className="text-orange-500" />}
                  <div>
                    <p className={`font-black tracking-tight ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{isLightMode ? 'Smart Light Mode' : 'Smart Dark Mode'}</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Cinematic depth with amber accents</p>
                  </div>
                </div>
                <Toggle active={!isLightMode} onClick={() => { toggleTheme(); setToast("Theme synchronized"); }} />
              </div>
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 opacity-50">
                <div className="flex items-center gap-4">
                  <Globe size={18} className="text-gray-500" />
                  <div>
                    <p className={`font-black tracking-tight ${isLightMode ? 'text-gray-900' : 'text-white'}`}>System Language</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">English (Global Node)</p>
                  </div>
                </div>
                <ChevronDown size={16} />
              </div>
            </div>
          </SettingsOption>

          {/* Notifications Section */}
          <SettingsOption icon={Bell} title="System Notifications" desc="Alert Protocols & Reminders">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <Smartphone size={18} className="text-orange-500" />
                  <div>
                    <p className="font-black text-white tracking-tight">Push Alerts</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Receive operational updates</p>
                  </div>
                </div>
                <Toggle active={notifications} onClick={() => { setNotifications(!notifications); setToast(`Alerts ${!notifications ? 'Enabled' : 'Disabled'}`); }} />
              </div>
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <Volume2 size={18} className="text-orange-500" />
                  <div>
                    <p className="font-black text-white tracking-tight">Audio Feedback</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">System status sounds</p>
                  </div>
                </div>
                <Toggle active={soundEffects} onClick={() => { setSoundEffects(!soundEffects); setToast(`Audio ${!soundEffects ? 'Enabled' : 'Disabled'}`); }} />
              </div>
            </div>
          </SettingsOption>

          {/* AI Settings Section */}
          <SettingsOption icon={Zap} title="AI Smart Engine" desc="Autonomous Logic & Optimization">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <Zap size={18} className="text-orange-500" />
                  <div>
                    <p className="font-black text-white tracking-tight">Auto-Reschedule</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Automatically optimize missed syncs</p>
                  </div>
                </div>
                <Toggle active={autoReschedule} onClick={() => { setAutoReschedule(!autoReschedule); setToast(`Smart Sync ${!autoReschedule ? 'Active' : 'Standby'}`); }} />
              </div>
            </div>
          </SettingsOption>

          {/* Security Section */}
          <SettingsOption icon={Lock} title="System Security" desc="Access Control & Keys">
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">Update Security Key</label>
                    <input type="password" placeholder="New Password" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-all font-medium" />
                  </div>
               </div>
               <button className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all ripple">
                 Synchronize Security
               </button>
            </div>
          </SettingsOption>

          {/* Danger Zone */}
          <div className="pt-12 border-t border-white/5 space-y-6">
             <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] ml-2">Danger Zone</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-rose-500/20 hover:bg-rose-500/5 group transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                         <Trash2 size={20} />
                      </div>
                      <div>
                         <p className="font-black text-white tracking-tight">Wipe Operational Data</p>
                         <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">This action is irreversible</p>
                      </div>
                   </div>
                   <button className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                      Confirm Wipe
                   </button>
                </div>
                <div className="glass-card p-6 border-white/10 hover:bg-white/5 group transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                         <LogOut size={20} />
                      </div>
                      <div>
                         <p className="font-black text-white tracking-tight">Terminate Session</p>
                         <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Logout of current node</p>
                      </div>
                   </div>
                   <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                      Log Out
                   </button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Settings;