const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
  },
  priority: {
    type: String,
    default: 'Medium'
  },
  duration: {
    type: Number,
  },
  deadline: {
    type: Date,
  },
  startTime: {
    type: String,
  },
  rescheduledCount: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  healthScore: {
    type: Number,
  },
  expiredAt: {
    type: Date,
    default: null,
  },
  notificationSentAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
  },
  repeatFrequency: {
    type: String, // 'once', 'daily', 'workdays', 'custom'
    default: 'once'
  },
  repeatDays: {
    type: [Number], // 0-6 (Sun-Sat)
    default: []
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);