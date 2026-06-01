import React, { useState } from "react";
import api from "../../api";
import { Plus, CheckCircle2, Circle } from "lucide-react";

export default function HabitTracker({ habits, dateStr, onUpdate }) {
  const [newHabitName, setNewHabitName] = useState("");

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await api.post('/fitness/habits', { name: newHabitName, frequency: 'daily' });
      setNewHabitName("");
      onUpdate();
    } catch (err) { console.error(err); }
  };

  const toggleHabit = async (habitId) => {
    try {
      await api.patch(`/fitness/habits/${habitId}/toggle`, { dateStr });
      onUpdate();
    } catch (err) { console.error(err); }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/fitness/habits/${habitId}`);
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card w-full max-w-full overflow-hidden p-5 sm:p-6 md:p-8 flex flex-col flex-1 border border-white/5 bg-white/[0.02] relative group">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4">Daily Habits</h4>
      
      <div className="space-y-3 mb-6">
        {habits.map(habit => {
          const isCompleted = habit.completedDates.includes(dateStr);
          return (
            <div key={habit._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleHabit(habit._id)}>
                {isCompleted ? <CheckCircle2 size={20} className="text-lime-500" /> : <Circle size={20} className="text-gray-500" />}
                <span className={`text-sm font-bold ${isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{habit.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-lime-500 font-bold bg-lime-500/10 px-2 py-1 rounded-md">🔥 {habit.streak}</span>
                <button onClick={() => deleteHabit(habit._id)} className="text-gray-500 hover:text-rose-500 transition-colors">✕</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="text" 
          placeholder="New Habit..." 
          value={newHabitName}
          onChange={e => setNewHabitName(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lime-500/50"
        />
        <button onClick={addHabit} className="p-2.5 bg-lime-500 text-white rounded-xl hover:bg-lime-600 transition-colors">
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
