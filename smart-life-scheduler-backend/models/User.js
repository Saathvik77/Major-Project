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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
