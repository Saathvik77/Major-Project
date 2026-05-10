const express = require("express");
const router = express.Router();
const syncService = require("../services/syncService");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

// In a real app, we would handle OAuth callback here.
// For now, we'll provide a mock sync trigger.
router.post("/calendar", async (req, res) => {
    try {
        // Mock auth for demonstration
        // const tasks = await syncService.syncGoogleCalendar(req.user.id, null);
        res.json({ message: "Google Calendar sync initiated. (Requires OAuth setup for full functionality)" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/parse-email", async (req, res) => {
    try {
        const { content } = req.body;
        const result = await syncService.parseEmailForTasks(content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/fitness", async (req, res) => {
    try {
        const healthData = await syncService.syncFitnessData(req.user.id, null);
        res.json(healthData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
