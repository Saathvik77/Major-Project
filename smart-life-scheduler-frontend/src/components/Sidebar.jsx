import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  FileText, 
  HeartPulse, 
  Bot, 
  Settings, 
  LogOut,
  Hexagon
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: <LayoutDashboard size={22} />, label: "Dashboard", path: "/dashboard" },
  { icon: <ClipboardList size={22} />, label: "Tasks", path: "/tasks" },
  { icon: <Bot size={22} />, label: "AI Assistant", path: "/ai-assistant" },
  { icon: <BarChart3 size={22} />, label: "Analytics", path: "/analytics" },
  { icon: <FileText size={22} />, label: "Reports", path: "/reports" },
  { icon: <HeartPulse size={22} />, label: "Health", path: "/health" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar-container">
      {/* Logo Area */}
      <div className="mb-12 cursor-pointer group" onClick={() => navigate("/dashboard")}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
          <Bot fill="white" size={24} className="animate-pulse" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item group ${isActive ? 'sidebar-item-active' : ''}`}
            >
              {item.icon}
              <span className="sidebar-tooltip">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="flex flex-col items-center gap-6 mt-auto">
        <div className="sidebar-item" onClick={() => navigate("/profile")}>
          <Settings size={22} />
          <span className="sidebar-tooltip">Settings</span>
        </div>
        <div className="sidebar-item text-red-500/70 hover:text-red-500" onClick={handleLogout}>
          <LogOut size={22} />
          <span className="sidebar-tooltip">Logout</span>
        </div>
      </div>
    </aside>
  );
}
