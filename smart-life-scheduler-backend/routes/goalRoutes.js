const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", goalController.createGoal);
router.get("/", goalController.getGoals);
router.get("/:id", goalController.getGoalById);
router.put("/:id/progress", goalController.updateGoalProgress);
router.delete("/:id", goalController.deleteGoal);

module.exports = router;
