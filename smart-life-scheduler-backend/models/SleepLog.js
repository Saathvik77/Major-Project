const mongoose = require("mongoose");

const sleepLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sleepTime: { type: String, required: true }, // e.g. "22:30"
  wakeTime: { type: String, required: true }, // e.g. "06:30"
  duration: { type: Number, required: true }, // calculated in hours
  date: { type: String, required: true }, // YYYY-MM-DD (usually relates to the wake date)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SleepLog", sleepLogSchema);
