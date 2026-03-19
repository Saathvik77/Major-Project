import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const SettingsOption = ({ icon: Icon, title, desc, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 p-5 hover:bg-white/[0.04] cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white/90">{title}</h3>
          <p className="text-sm text-slate-400">{desc}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-500 mr-2"
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
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-6 text-slate-300 text-sm">
              {children || (
                <div className="flex items-center justify-center h-20 text-slate-500 italic">
                  Configuration options loading...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Settings() {
  const [taskStats, setTaskStats] = useState({ completed: 0, missed: 0 });
  const [isDarkMode, setIsDarkMode] = useState(true); // Premium Warm Dark is default

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks?limit=100');
        const tasks = res.data.tasks || [];
        const completed = tasks.filter(t => t.completed).length;
        
        // Count missed (simplified logic: expired tasks not completed)
        const now = new Date();
        const missed = tasks.filter(t => !t.completed && new Date(t.date) < now).length;
        
        setTaskStats({ completed, missed });
      } catch (err) {
        console.error("Failed to fetch tasks for settings:", err);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-transparent pl-0 md:pl-[84px] pb-24 md:pb-10 p-4 md:p-6 lg:p-10 page-transition text-white">
      <div className="max-w-[800px] mx-auto relative z-10 w-full flex flex-col gap-8">
        
        <header className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 md:mb-0">
           <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <SettingsIcon size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-white/90 tracking-tight">Settings</h1>
              <p className="text-sm text-slate-400 font-medium">Manage your account and preferences</p>
           </div>
        </header>

        <div className="space-y-4">
          <SettingsOption icon={User} title="Account Profile" desc="Change your name, email, and avatar">
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                 <input type="text" defaultValue="Alex Rivera" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                 <input type="email" defaultValue="alex@example.com" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
               </div>
               <button className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors mt-2">
                 Save Changes
               </button>
            </div>
          </SettingsOption>
          
          <SettingsOption icon={Bell} title="Notifications" desc="Configure your alert preferences">
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                 <div>
                   <p className="font-bold text-white/90">Task Completion Alerts</p>
                   <p className="text-xs text-slate-500 mt-1">Get notified of positive reinforcement</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="text-emerald-400 font-black text-sm">{taskStats.completed} Completed</div>
                   <div className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                   </div>
                 </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                 <div>
                   <p className="font-bold text-white/90">Missed Task AI Warnings</p>
                   <p className="text-xs text-slate-500 mt-1">AI coaching for slipped priorities</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="text-rose-500 font-black text-sm">{taskStats.missed} Missed</div>
                   <div className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                   </div>
                 </div>
               </div>
            </div>
          </SettingsOption>

          <SettingsOption icon={Lock} title="Password & Security" desc="Manage your authentication methods">
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm New Password</label>
                 <input type="password" placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50 transition-colors" />
               </div>
               <button className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors mt-2 border border-white/10 border-t-white/30">
                 Update Password
               </button>
            </div>
          </SettingsOption>

          <SettingsOption icon={Eye} title="Appearance" desc="Customize themes and layouts">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white/90">Warm Dark Theme</p>
                <p className="text-xs text-slate-500 mt-1">Premium dark grey with amber glow</p>
              </div>
              <div 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isDarkMode ? 'bg-orange-500' : 'bg-slate-700'}`}
              >
                <motion.div 
                  initial={false}
                  animate={{ x: isDarkMode ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" 
                />
              </div>
            </div>
          </SettingsOption>
        </div>
      </div>
    </div>
  );
}

export default Settings;
