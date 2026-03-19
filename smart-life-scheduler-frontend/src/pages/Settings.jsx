import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Eye, Shield } from 'lucide-react';

const SettingsOption = ({ icon: Icon, title, desc }) => (
  <div className="flex items-center gap-4 p-4 glass-card hover:bg-white/60 cursor-pointer transition-all">
    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 text-slate-800">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  </div>
);

function Settings() {
  return (
    <div className="min-h-screen bg-transparent pl-[84px] p-10 page-transition">
      <div className="max-w-[800px] mx-auto">
        <header className="mb-10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <SettingsIcon size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 font-medium">Manage your account and preferences</p>
           </div>
        </header>

        <div className="space-y-4">
          <SettingsOption icon={User} title="Account Profile" desc="Change your name, email, and avatar" />
          <SettingsOption icon={Bell} title="Notifications" desc="Configure your alert preferences" />
          <SettingsOption icon={Lock} title="Password & Security" desc="Manage your authentication methods" />
          <SettingsOption icon={Eye} title="Appearance" desc="Customize themes and layouts" />
          <SettingsOption icon={Shield} title="Privacy Settings" desc="Control who sees your performance data" />
        </div>
      </div>
    </div>
  );
}

export default Settings;
