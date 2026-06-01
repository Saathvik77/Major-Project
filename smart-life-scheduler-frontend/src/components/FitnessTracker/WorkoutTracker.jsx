import React, { useState } from "react";
import api from "../../api";
import { Dumbbell } from "lucide-react";

export default function WorkoutTracker({ workouts, dateStr, onUpdate }) {
  const [workoutType, setWorkoutType] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState(60);
  const [calories, setCalories] = useState("");

  const logWorkout = async () => {
    if (!workoutType.trim()) return;
    try {
      await api.post('/fitness/workouts', { 
        type: workoutType, 
        duration: workoutDuration, 
        calories: calories ? parseInt(calories) : null,
        date: dateStr 
      });
      setWorkoutType("");
      setWorkoutDuration(60);
      setCalories("");
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-card w-full max-w-full overflow-hidden p-5 sm:p-6 md:p-8 flex flex-col flex-1 border border-white/5 bg-white/[0.02] relative group">
      <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Dumbbell size={16} className="text-orange-500" /> Workout Log
      </h4>
      
      <div className="space-y-3 mb-6">
        {workouts.map(workout => (
          <div key={workout._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm font-bold text-white">{workout.type}</span>
            <div className="flex gap-4">
               {workout.calories && (
                 <span className="text-xs text-rose-400 font-black uppercase tracking-wide">{workout.calories} kcal</span>
               )}
               <span className="text-xs text-orange-400 font-black uppercase tracking-wide">{workout.duration} min</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <input 
          type="text" 
          placeholder="Workout Type (e.g. Back & Biceps)" 
          value={workoutType}
          onChange={e => setWorkoutType(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={workoutDuration}
            onChange={e => setWorkoutDuration(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
          />
          <input 
            type="number" 
            placeholder="Calories" 
            value={calories}
            onChange={e => setCalories(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
          />
          <button onClick={logWorkout} className="col-span-2 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 font-black rounded-xl hover:bg-orange-500/40 transition-colors uppercase tracking-wide">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
