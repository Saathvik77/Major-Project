import React, { useState } from 'react';
import { Home, CheckSquare, Activity, PieChart, User, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddTaskModal from './AddTaskModal';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Activity, label: 'Health', path: '/health' },
    { icon: PieChart, label: 'Reports', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <div className="fixed bottom-6 left-6 right-6 z-40">
        <div className="bottom-nav-container bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-2 flex items-center justify-between relative px-4 text-gray-400">
          <div className="flex items-center justify-between w-full p-2 pr-16 space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${isActive ? 'text-primaryTeal bg-primaryTeal/10' : 'hover:text-gray-200 hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {isActive && <span className="text-[10px] font-bold mt-1">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-secondaryCyan to-primaryTeal text-white shadow-lg shadow-teal-500/30 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all outline-none"
          >
            <Plus className={`w-8 h-8 stroke-[3px] transition-transform duration-300 ${isModalOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
