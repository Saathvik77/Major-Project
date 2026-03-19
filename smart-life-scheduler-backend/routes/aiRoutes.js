const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { chatWithAI } = require("../controllers/aiController");

// AI Chat endpoint
router.post("/chat", protect, chatWithAI);

module.exports = router;
