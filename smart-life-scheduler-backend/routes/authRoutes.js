const BlacklistedToken = require("../models/BlacklistedToken");
const { body } = require("express-validator");
const { validate } = require("../middleware/validationMiddleware");
const protect = require("../middleware/authMiddleware");

const express = require("express");

// ✅ Import controllers from separate file
const { registerUser, loginUser, updateProfile, githubLogin, phoneLogin } = require("../controllers/authController");

const router = express.Router();
// =======================
// ROUTES
// =======================

// REGISTER
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  registerUser
);

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

// PHONE LOGIN
router.post("/phone", phoneLogin);

// GITHUB LOGIN
router.post("/github", githubLogin);

// =======================
// LOGOUT
// =======================
router.post("/logout", protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await BlacklistedToken.create({ token });

    res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PROTECTED ROUTE
router.get("/profile", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Welcome to protected profile",
    user: req.user,
  });
});

// UPDATE PROFILE
router.put("/profile", protect, updateProfile);

module.exports = router;