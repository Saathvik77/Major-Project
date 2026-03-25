const Task = require("../models/Task");


exports.getTasks = async (req, res) => {
  try {
    const { date, limit = 50 } = req.query;
    const userId = req.user._id;
    
    let query = { user: userId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const tasks = await Task.find(query).sort({ startTime: 1 }).limit(parseInt(limit));
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user._id;
    const taskData = {
      ...req.body,
      user: userId,
      completed: false
    };

    const task = new Task(taskData);
    const savedTask = await task.save();
    res.json({ task: savedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: userId },
      req.body,
      { new: true }
    );
    
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.json({ task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user._id;
    
    const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};