const Goal = require("../models/Goal");
const goalService = require("../services/goalService");

exports.createGoal = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Goal title is required" });

    const goal = await goalService.createGoalFromAI(req.user.id, title);
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).populate("tasks");
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id }).populate("tasks");
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
    try {
        const { progress, status } = req.body;
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { progress, status },
            { new: true }
        );
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        res.json({ message: "Goal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
