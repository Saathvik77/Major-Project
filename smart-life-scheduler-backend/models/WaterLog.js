const mongoose = require("mongoose");

const waterLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true }, // in Liters
  goal: { type: Number, default: 3.0 }, // in Liters
  date: { type: String, required: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WaterLog", waterLogSchema);
