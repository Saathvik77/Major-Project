import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const TaskItem = ({ title, time, priority, onComplete, isExpired, category = "General" }) => {
  const priorityColor = {
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group glass-card p-4 flex items-center justify-between transition-all duration-300
        ${isExpired ? 'border-rose-500/30 bg-rose-500/[0.03]' : 'hover:border-white/20'}
      `}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onComplete}
          className="text-gray-600 hover:text-amber-500 transition-colors"
        >
          <Circle size={22} strokeWidth={1.5} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <h4 className={`text-sm font-bold truncate ${isExpired ? 'text-rose-200' : 'text-white'}`}>
               {title}
             </h4>
             {isExpired && <AlertCircle size={14} className="text-rose-400" />}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Clock size={12} className="text-amber-500/60" /> {time}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${priorityColor[priority] || priorityColor.Medium}`}>
              {priority}
            </span>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
        <button 
          onClick={onComplete}
          className="bg-white/5 border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;
