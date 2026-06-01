import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { Target } from "lucide-react";
import HabitTracker from "./HabitTracker";
import WorkoutTracker from "./WorkoutTracker";
import WaterTracker from "./WaterTracker";
import SleepTracker from "./SleepTracker";
import WeightTracker from "./WeightTracker";
import StepTracker from "./StepTracker";

export default function FitnessTracker({ selectedDate }) {
  const [habits, setHabits] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [waterAmount, setWaterAmount] = useState(0);
  const [sleepLog, setSleepLog] = useState(null);
  const [weight, setWeight] = useState(null);
  const [steps, setSteps] = useState(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, workoutsRes, waterRes, sleepRes, weightRes, stepsRes] = await Promise.all([
        api.get(`/fitness/habits`),
        api.get(`/fitness/workouts?date=${dateStr}`),
        api.get(`/fitness/water?date=${dateStr}`),
        api.get(`/fitness/sleep?date=${dateStr}`),
        api.get(`/fitness/weight?date=${dateStr}`),
        api.get(`/fitness/steps?date=${dateStr}`)
      ]);

      setHabits(habitsRes.data);
      setWorkouts(workoutsRes.data);
      setWaterAmount(waterRes.data.length > 0 ? waterRes.data[0].amount : 0);
      setSleepLog(sleepRes.data.length > 0 ? sleepRes.data[0] : null);
      setWeight(weightRes.data.length > 0 ? weightRes.data[0].weight : null);
      setSteps(stepsRes.data.length > 0 ? stepsRes.data[0].steps : null);
    } catch (err) {
      console.error("Error fetching fitness data:", err);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 mt-8 border-t border-white/10 pt-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-500">
          <Target size={20} />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">Fitness & Habits</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="flex flex-col gap-6 md:gap-8 h-full">
          <HabitTracker habits={habits} dateStr={dateStr} onUpdate={fetchData} />
          <WaterTracker waterAmount={waterAmount} dateStr={dateStr} onUpdate={fetchData} />
        </div>
        
        <div className="flex flex-col gap-6 md:gap-8 h-full">
          <WorkoutTracker workouts={workouts} dateStr={dateStr} onUpdate={fetchData} />
          <SleepTracker sleepLog={sleepLog} dateStr={dateStr} onUpdate={fetchData} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
             <WeightTracker weight={weight} dateStr={dateStr} onUpdate={fetchData} />
             <StepTracker steps={steps} dateStr={dateStr} onUpdate={fetchData} />
          </div>
        </div>
      </div>
    </div>
  );
}
