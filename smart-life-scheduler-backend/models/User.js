const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    targetWeight: {
      type: Number,
      default: null,
    },
    phno: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    aiContext: {
      flow: { type: String, default: null },
      step: { type: Number, default: 0 },
      data: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    healthData: {
      steps: { type: Number, default: 0 },
      sleepHours: { type: Number, default: 0 },
      screenTimeMinutes: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now }
    },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
