const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const fitnessController = require("../controllers/fitnessController");

router.use(authMiddleware);

// Habits
router.get("/habits", fitnessController.getHabits);
router.post("/habits", fitnessController.createHabit);
router.patch("/habits/:id/toggle", fitnessController.toggleHabit);
router.delete("/habits/:id", fitnessController.deleteHabit);

// Workouts
router.get("/workouts", fitnessController.getWorkouts);
router.post("/workouts", fitnessController.createWorkout);

// Water Logs
router.get("/water", fitnessController.getWaterLogs);
router.post("/water", fitnessController.logWater);

// Sleep Logs
router.get("/sleep", fitnessController.getSleepLogs);
router.post("/sleep", fitnessController.logSleep);

// Weight Logs
router.get("/weight", fitnessController.getWeightLogs);
router.post("/weight", fitnessController.logWeight);

module.exports = router;
