const mongoose = require("mongoose");

const stepLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  steps: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  }
}, { timestamps: true });

// Ensure one log per user per date
stepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StepLog", stepLogSchema);
