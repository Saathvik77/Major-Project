const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  calories: { type: Number },
  date: { type: Date, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workout", workoutSchema);
