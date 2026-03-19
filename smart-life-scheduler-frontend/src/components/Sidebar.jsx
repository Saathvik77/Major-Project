import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  User, 
  Settings, 
  LogOut,
  Bot,
  BrainCircuit,
  PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ icon: Icon, to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
      ${isActive 
        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
    `}
  >
    <Icon size={22} strokeWidth={1.5} />
    
    {/* Tooltip */}
    <div className="absolute left-16 px-2 py-1 rounded-md bg-zinc-900 border border-white/10 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
      {label}
    </div>

    {/* Active Indicator Dot */}
    <NavLink to={to}>
      {({ isActive }) => isActive && (
        <motion.div 
          layoutId="activeSideDot"
          className="absolute -left-1 w-1 h-3 bg-amber-500 rounded-full"
        />
      )}
    </NavLink>
  </NavLink>
);

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[84px] sidebar-glass flex flex-col items-center py-8 z-[100]">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Bot size={24} strokeWidth={2} />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-5 items-center">
        <SidebarItem icon={LayoutDashboard} to="/dashboard" label="Dashboard" />
        <SidebarItem icon={CheckSquare} to="/tasks" label="Tasks" />
        <SidebarItem icon={BarChart3} to="/analytics" label="Analytics" />
        <SidebarItem icon={BrainCircuit} to="/ai-coach" label="AI Coach" />
        <SidebarItem icon={PieChart} to="/reports" label="Reports" />
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 items-center">
        <SidebarItem icon={Settings} to="/settings" label="Settings" />
        <SidebarItem icon={User} to="/profile" label="Profile" />
        <button className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all">
          <LogOut size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
