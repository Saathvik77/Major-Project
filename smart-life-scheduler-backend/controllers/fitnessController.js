const Habit = require("../models/Habit");
const Workout = require("../models/Workout");
const WaterLog = require("../models/WaterLog");
const SleepLog = require("../models/SleepLog");
const WeightLog = require("../models/WeightLog");
const StepLog = require("../models/StepLog");

// Helpers
const getStartOfDay = (dateStr) => {
  if (dateStr) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (dateStr) => {
  const d = getStartOfDay(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
};

// --- HABITS ---
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { name, frequency, customDays } = req.body;
    const newHabit = new Habit({
      user: req.user.id,
      name,
      frequency,
      customDays
    });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateStr } = req.body; // YYYY-MM-DD
    const habit = await Habit.findOne({ _id: id, user: req.user.id });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const dateIndex = habit.completedDates.indexOf(dateStr);
    if (dateIndex > -1) {
      habit.completedDates.splice(dateIndex, 1);
    } else {
      habit.completedDates.push(dateStr);
    }
    // Calculate streak simply for now (just count total or continuous)
    habit.streak = habit.completedDates.length; 
    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// --- WORKOUTS ---
exports.getWorkouts = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    let filter = { user: req.user.id };
    if (date) {
      filter.date = { $gte: getStartOfDay(date), $lte: getEndOfDay(date) };
    }
    const workouts = await Workout.find(filter).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const { type, duration, calories, date, notes } = req.body;
    const newWorkout = new Workout({
      user: req.user.id,
      type,
      duration,
      calories,
      date: new Date(date || Date.now()),
      notes
    });
    await newWorkout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// --- WATER LOGS ---
exports.getWaterLogs = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { user: req.user.id };
    if (date) filter.date = date; // YYYY-MM-DD
    const logs = await WaterLog.find(filter);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logWater = async (req, res) => {
  try {
    const { amount, date } = req.body;
    let log = await WaterLog.findOne({ user: req.user.id, date });
    if (log) {
      log.amount += amount;
      await log.save();
    } else {
      log = new WaterLog({ user: req.user.id, amount, date });
      await log.save();
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// --- SLEEP LOGS ---
exports.getSleepLogs = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { user: req.user.id };
    if (date) filter.date = date;
    const logs = await SleepLog.find(filter);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logSleep = async (req, res) => {
  try {
    const { sleepTime, wakeTime, duration, date } = req.body;
    let log = await SleepLog.findOne({ user: req.user.id, date });
    if (log) {
      log.sleepTime = sleepTime;
      log.wakeTime = wakeTime;
      log.duration = duration;
      await log.save();
    } else {
      log = new SleepLog({ user: req.user.id, sleepTime, wakeTime, duration, date });
      await log.save();
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// --- WEIGHT LOGS ---
exports.getWeightLogs = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { user: req.user.id };
    if (date) filter.date = date;
    const logs = await WeightLog.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logWeight = async (req, res) => {
  try {
    const { weight, date } = req.body;
    let log = await WeightLog.findOne({ user: req.user.id, date });
    if (log) {
      log.weight = weight;
      await log.save();
    } else {
      log = new WeightLog({ user: req.user.id, weight, date });
      await log.save();
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- STEP LOGS ---
exports.getStepLogs = async (req, res) => {
  try {
    const { date } = req.query;
    let filter = { userId: req.user.id };
    if (date) filter.date = date;
    const logs = await StepLog.find(filter).sort({ date: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logSteps = async (req, res) => {
  try {
    const { steps, date } = req.body;
    let log = await StepLog.findOne({ userId: req.user.id, date });
    if (log) {
      log.steps = steps;
      await log.save();
    } else {
      log = new StepLog({ userId: req.user.id, steps, date });
      await log.save();
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
