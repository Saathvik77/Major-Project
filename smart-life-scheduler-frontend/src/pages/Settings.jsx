import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Eye, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  return (
    <div className="min-h-screen bg-transparent pl-[84px] p-6 lg:p-10 page-transition text-white">
      <div className="max-w-[800px] mx-auto relative z-10 w-full flex flex-col gap-8">
        
        <header className="flex items-center gap-4">
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
          
          <SettingsOption icon={Bell} title="Notifications" desc="Configure your alert preferences" />
          <SettingsOption icon={Lock} title="Password & Security" desc="Manage your authentication methods" />
          <SettingsOption icon={Eye} title="Appearance" desc="Customize themes and layouts">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white/90">Warm Dark Theme</p>
                <p className="text-xs text-slate-500 mt-1">Premium dark grey with amber glow</p>
              </div>
              <div className="w-12 h-6 bg-orange-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
              </div>
            </div>
          </SettingsOption>
          <SettingsOption icon={Shield} title="Privacy Settings" desc="Control who sees your performance data" />
        </div>
      </div>
    </div>
  );
}

export default Settings;
