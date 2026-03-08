const Task = require("../models/Task");


exports.getTasks = async (req, res) => {

  try {

    const tasks = await Task.find().sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};



exports.createTask = async (req, res) => {

  try {

    const task = new Task({
      title: req.body.title,
      completed: false
    });

    const savedTask = await task.save();

    res.json(savedTask);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};



exports.deleteTask = async (req, res) => {

  try {

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};