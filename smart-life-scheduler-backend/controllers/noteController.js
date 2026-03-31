const Note = require("../models/Note");

// CREATE NOTE
const createNote = async (req, res) => {
  try {
    const { content, date, tags, color } = req.body;
    const note = await Note.create({
      user: req.user.id,
      content,
      date: date || new Date(),
      tags: tags || [],
      color: color || "#d9e87b",
    });
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET NOTES BY DATE
const getNotesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const searchDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const notes = await Note.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE NOTE
const updateNote = async (req, res) => {
  try {
    const { content, tags, convertedToTask, color } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { content, tags, convertedToTask, color },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE NOTE
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNote,
  getNotesByDate,
  updateNote,
  deleteNote,
};
