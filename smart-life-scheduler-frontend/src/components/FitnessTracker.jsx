import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { Dumbbell, Droplets, Moon, Scale, Target, Plus, CheckCircle2, Circle } from "lucide-react";

export default function FitnessTracker({ selectedDate }) {
  const [habits, setHabits] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [waterAmount, setWaterAmount] = useState(0);
  const [sleepLog, setSleepLog] = useState(null);
  const [weight, setWeight] = useState(null);

  // Form states
  const [newHabitName, setNewHabitName] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [sleepTime, setSleepTime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [newWeight, setNewWeight] = useState("");

  const dateStr = selectedDate.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, workoutsRes, waterRes, sleepRes, weightRes] = await Promise.all([
        api.get(`/fitness/habits`),
        api.get(`/fitness/workouts?date=${dateStr}`),
        api.get(`/fitness/water?date=${dateStr}`),
        api.get(`/fitness/sleep?date=${dateStr}`),
        api.get(`/fitness/weight?date=${dateStr}`)
      ]);

      setHabits(habitsRes.data);
      setWorkouts(workoutsRes.data);
      setWaterAmount(waterRes.data.length > 0 ? waterRes.data[0].amount : 0);
      setSleepLog(sleepRes.data.length > 0 ? sleepRes.data[0] : null);
      setWeight(weightRes.data.length > 0 ? weightRes.data[0].weight : null);
    } catch (err) {
      console.error("Error fetching fitness data:", err);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Habit Handlers ---
  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      await api.post('/fitness/habits', { name: newHabitName, frequency: 'daily' });
      setNewHabitName("");
      fetchData();
    } catch (err) { console.error(err); }
  };

  const toggleHabit = async (habitId) => {
    try {
      await api.patch(`/fitness/habits/${habitId}/toggle`, { dateStr });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/fitness/habits/${habitId}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- Workout Handlers ---
  const logWorkout = async () => {
    if (!workoutType.trim()) return;
    try {
      await api.post('/fitness/workouts', { type: workoutType, duration: workoutDuration, date: dateStr });
      setWorkoutType("");
      setWorkoutDuration(30);
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- Water Handlers ---
  const addWater = async (amount) => {
    try {
      await api.post('/fitness/water', { amount, date: dateStr });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- Sleep Handlers ---
  const logSleep = async () => {
    try {
      let sh = parseInt(sleepTime.split(':')[0]);
      let sm = parseInt(sleepTime.split(':')[1]);
      let wh = parseInt(wakeTime.split(':')[0]);
      let wm = parseInt(wakeTime.split(':')[1]);
      
      let sleepMinutes = (wh * 60 + wm) - (sh * 60 + sm);
      if (sleepMinutes < 0) sleepMinutes += 24 * 60; // crossed midnight
      
      const duration = (sleepMinutes / 60).toFixed(1);

      await api.post('/fitness/sleep', { sleepTime, wakeTime, duration, date: dateStr });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- Weight Handlers ---
  const logWeight = async () => {
    if (!newWeight) return;
    try {
      await api.post('/fitness/weight', { weight: parseFloat(newWeight), date: dateStr });
      setNewWeight("");
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 mt-8 border-t border-white/10 pt-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500">
          <Target size={20} />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">Fitness & Habits</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits Section */}
        <div className="glass-card p-6 border border-white/5 bg-white/[0.02]">
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

        {/* Workout Section */}
        <div className="glass-card p-6 border border-white/5 bg-white/[0.02]">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-orange-500" /> Workout Log
          </h4>
          
          <div className="space-y-3 mb-6">
            {workouts.map(workout => (
              <div key={workout._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-white">{workout.type}</span>
                <span className="text-xs text-orange-400 font-black uppercase tracking-wide">{workout.duration} min</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Workout Type..." 
              value={workoutType}
              onChange={e => setWorkoutType(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
            <input 
              type="number" 
              placeholder="Min" 
              value={workoutDuration}
              onChange={e => setWorkoutDuration(e.target.value)}
              className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
            />
            <button onClick={logWorkout} className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
              Log
            </button>
          </div>
        </div>

        {/* Water Section */}
        <div className="glass-card p-6 border border-white/5 bg-white/[0.02]">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Droplets size={16} className="text-cyan-500" /> Water Intake
          </h4>
          
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="text-4xl font-black text-white tracking-tighter">
              {waterAmount.toFixed(1)} <span className="text-lg text-cyan-500">/ 3.0 L</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (waterAmount / 3.0) * 100)}%` }}
              />
            </div>
            <div className="flex gap-2 w-full mt-2">
              <button onClick={() => addWater(0.25)} className="flex-1 py-2 bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase tracking-wide rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">+250ml</button>
              <button onClick={() => addWater(0.5)} className="flex-1 py-2 bg-cyan-500/10 text-cyan-400 font-black text-xs uppercase tracking-wide rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">+500ml</button>
            </div>
          </div>
        </div>

        {/* Sleep & Weight Section */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex-1">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Moon size={16} className="text-indigo-400" /> Sleep Log
            </h4>
            
            {sleepLog ? (
              <div className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-wide">Duration</p>
                  <p className="text-2xl font-black text-white">{sleepLog.duration}h</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400">{sleepLog.sleepTime} - {sleepLog.wakeTime}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Sleep</label>
                  <input type="time" value={sleepTime} onChange={e => setSleepTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Wake</label>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
                </div>
                <button onClick={logSleep} className="px-4 py-2 mt-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20">Log</button>
              </div>
            )}
          </div>

          <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex-1">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Scale size={16} className="text-emerald-400" /> Weight
            </h4>
            
            {weight ? (
              <div className="flex items-center gap-3 p-2">
                <span className="text-3xl font-black text-white tracking-tighter">{weight}</span>
                <span className="text-emerald-500 font-black uppercase tracking-wide">kg</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="kg" 
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
                <button onClick={logWeight} className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20">Log</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
