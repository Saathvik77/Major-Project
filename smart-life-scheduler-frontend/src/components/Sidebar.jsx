import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
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
          className="absolute -left-1 w-1 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(255,140,60,0.5)]"
        />
      )}
    </NavLink>
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="fixed bottom-0 md:top-0 left-0 w-full md:w-[84px] h-[72px] md:h-screen sidebar-glass flex flex-row md:flex-col items-center justify-around md:justify-start md:py-8 z-[100] border-t md:border-t-0 border-white/10 px-4 md:px-0 transition-all duration-300">
      {/* Logo */}
      <div className="hidden md:flex mb-12 flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
          <Settings size={24} strokeWidth={2} />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-row md:flex-col gap-2 md:gap-5 items-center w-full md:w-auto justify-around md:justify-start md:flex-1">
        <SidebarItem icon={LayoutDashboard} to="/dashboard" label="Dashboard" />
        <SidebarItem icon={CheckSquare} to="/tasks" label="Tasks" />
        <SidebarItem icon={BarChart3} to="/analytics" label="Analytics" />
        <SidebarItem icon={Bot} to="/ai-assistant" label="AI Assistant" />
        
        {/* Mobile-only shortcuts */}
        <div className="md:hidden">
          <SidebarItem icon={User} to="/profile" label="Profile" />
        </div>
        <div className="md:hidden">
          <SidebarItem icon={Settings} to="/settings" label="Settings" />
        </div>

        <div className="hidden md:block">
          <SidebarItem icon={PieChart} to="/reports" label="Reports" />
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="hidden md:flex mt-auto flex-col gap-6 items-center">
        <SidebarItem icon={Settings} to="/settings" label="Settings" />
        <SidebarItem icon={User} to="/profile" label="Profile" />
        <button 
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all active:scale-90"
        >
          <LogOut size={22} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
