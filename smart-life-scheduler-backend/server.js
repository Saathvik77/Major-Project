require("dotenv").config();

const helmet = require("helmet");
const express = require("express");
const mongoose = require("mongoose");

const limiter = require("./middleware/rateLimiter");
const startAutoRescheduler = require("./Jobs/autoRescheduler");

const app = express();

/* =========================================
   SECURITY MIDDLEWARE
========================================= */
app.use(helmet());
const cors = require("cors");

app.use(cors());

app.use(express.json());
app.use("/api/auth", limiter);

/* =========================================
   ROUTES
========================================= */
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const intelligenceHistoryRoutes = require("./routes/intelligenceHistoryRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/intelligence", intelligenceRoutes);
app.use("/api/intelligence/history", intelligenceHistoryRoutes);
app.use("/api/ai", aiRoutes);

/* =========================================
   TEST ROUTE
========================================= */
app.get("/", (req, res) => {
  res.send("Smart Life Scheduler Backend is Running 🚀");
});

/* =========================================
   ERROR HANDLER
========================================= */
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

/* =========================================
   DATABASE CONNECTION + SERVER START
========================================= */
const PORT = process.env.PORT || 5000;
console.log("🚀 Initializing backend startup on PORT " + PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully to: " + process.env.MONGO_URI.split('@')[1].split('/')[0]);
    startAutoRescheduler(); // 👈 START CRON JOB
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    if (err.message.includes("ETIMEDOUT") || err.message.includes("ENOTFOUND")) {
      console.error("👉 SUGGESTION: Check your MONGO_URI in .env. If using Atlas, ensure your IP is whitelisted.");
    }
  });
