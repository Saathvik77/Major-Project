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
   TEST & HEALTH ROUTES
 ========================================= */
app.get("/", (req, res) => {
  res.send("Smart Life Scheduler Backend is Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000, 
    connectTimeoutMS: 15000,
  })
  .then(() => {
    const dbHost = process.env.MONGO_URI.includes('@') 
      ? process.env.MONGO_URI.split('@')[1].split('/')[0] 
      : "Local/Other";
    console.log("✅ MongoDB Connected Successfully to: " + dbHost);
    startAutoRescheduler(); 
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection STALLED/FAILED");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    
    // IMPORTANT: Don't let DB failure crash the whole process in dev
    console.warn("⚠️ Continuing in 'Offline Mode' (Database-dependent features may fail)");
  });
