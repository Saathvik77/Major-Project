const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  frequency: { type: String, enum: ["daily", "weekdays", "custom"], default: "daily" },
  customDays: [{ type: Number }], // 0-6
  streak: { type: Number, default: 0 },
  completedDates: [{ type: String }], // Array of YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Habit", habitSchema);
