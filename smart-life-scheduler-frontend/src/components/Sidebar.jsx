import React from "react";
import {
  LayoutDashboard,
  ClipboardList,
  PieChart,
  Bot,
  Settings,
  LogOut,
  Target,
  Brain,
  Activity,
  BookOpen
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NavItem = ({ icon: Icon, label, path, active, isBottom = false }) => (
  <Link to={path} className="relative group w-full flex justify-center py-3">
    <div className={`
      relative z-10 p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center
      ${active
        ? "bg-lime-500 text-white shadow-xl shadow-lime-500/20 scale-110"
        : "text-gray-500 hover:text-white hover:bg-white/5"}
    `}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      {isBottom && active && (
        <span className="text-[10px] text-lime-400 absolute -bottom-5 font-black uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      )}
    </div>

    {active && (
      <motion.div
        layoutId="activeNav"
        className={`absolute ${isBottom ? "top-0 left-1/4 right-1/4 h-1 rounded-b-full" : "left-0 top-1/4 bottom-1/4 w-1 rounded-r-full"} bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.8)]`}
      />
    )}

    {!isBottom && (
      <div className="absolute left-20 px-3 py-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-2xl z-50">
        {label}
      </div>
    )}
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ClipboardList, label: "Tasks", path: "/tasks" },
    { icon: PieChart, label: "Analytics", path: "/analytics" },
    { icon: Bot, label: "AI Assistant", path: "/ai-assistant" },
    { icon: Activity, label: "Health", path: "/health" },
    { icon: BookOpen, label: "Notes", path: "/notes" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-24 glass-morphism border-r border-white/5 flex-col items-center py-10 z-[100] shadow-2xl overflow-visible">
        <Link to="/dashboard" className="mb-12 group relative">
          <div className="w-12 h-12 rounded-[1.5rem] bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white shadow-2xl shadow-lime-500/20 transform group-hover:rotate-12 transition-all duration-500 border border-white/10">
            <Brain size={26} strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-2 bg-lime-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <nav className="flex-1 w-full flex flex-col items-center gap-4">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={path === item.path}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-6">
          <button
            onClick={handleLogout}
            className="p-3.5 text-gray-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-2xl group"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-[100] shadow-2xl">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            active={path === item.path}
            isBottom={true}
          />
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
