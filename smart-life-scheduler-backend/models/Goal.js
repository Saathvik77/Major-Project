const mongoose = require("mongoose");

const RoadmapStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetWeek: { type: Number },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }
});

const GoalSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: 'Personal'
    },
    targetDate: {
      type: Date,
    },
    roadmap: [RoadmapStepSchema],
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active'
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", GoalSchema);
