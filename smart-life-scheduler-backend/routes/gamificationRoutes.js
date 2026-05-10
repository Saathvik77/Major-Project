const express = require("express");
const router = express.Router();
const gamificationService = require("../services/gamificationService");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/missions", async (req, res) => {
    try {
        const missions = await gamificationService.getDailyMissions(req.user.id);
        res.json(missions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/stats", async (req, res) => {
    try {
        res.json({
            xp: req.user.xp,
            level: req.user.level
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
