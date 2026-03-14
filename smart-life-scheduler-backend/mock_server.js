const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Mock Tasks
app.get("/api/tasks", (req, res) => {
  res.json({
    tasks: []
  });
});

// Mock AI Challenge
app.get("/api/intelligence/weekly-challenge", (req, res) => {
  setTimeout(() => {
    res.json({
      title: "Gemini Focus Mastery",
      description: "Complete 4 deep-work sessions this week to maximize productivity. (Mocked via local backend connection)",
      target: 4,
      unit: "sessions",
      type: "focus"
    });
  }, 1000); 
});

app.listen(5000, () => console.log("Mock backend running on port 5000"));
