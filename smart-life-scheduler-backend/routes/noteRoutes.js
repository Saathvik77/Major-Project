const express = require("express");
const router = express.Router();
const { 
  createNote, 
  getNotesByDate, 
  updateNote, 
  deleteNote 
} = require("../controllers/noteController");
const protect = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.post("/", createNote);
router.get("/", getNotesByDate);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
