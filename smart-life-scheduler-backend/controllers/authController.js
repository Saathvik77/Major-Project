const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const IntelligenceReport = require("../models/IntelligenceReport");
const IntelligenceHistory = require("../models/IntelligenceHistory");

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phno } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phno: phno || "", // Save phone number if provided
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
    });

  } catch (error) {
    console.error("🔥 LOGIN CRITICAL FAILURE:", error);
    res.status(500).json({
      success: false,
      message: `Login error: ${error.message}. Please check server logs.`,
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, age, weight, phno, gender } = req.body;
    
    // Find the current logged in user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowable fields
    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (weight !== undefined) user.weight = weight;
    if (phno !== undefined) user.phno = phno;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        phno: user.phno,
        gender: user.gender
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PHONE LOGIN
const phoneLogin = async (req, res) => {
  try {
    const { phno } = req.body;

    // Check if user exists with this phone number
    const user = await User.findOne({ phno });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This phone number is not linked to any account.",
      });
    }

    // Generate our app's JWT
    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token: appToken,
    });
    
  } catch (error) {
    console.error("Phone Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Phone authentication failed",
    });
  }
};

// GITHUB LOGIN
const githubLogin = async (req, res) => {
  try {
    const { code } = req.body;

    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: "Ov23liCRvpsWvmnJTeVp",
        client_secret: process.env.GITHUB_CLIENT_SECRET || "72bab75fd2aac8703316dbcf4b804a186eab0328",
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
       return res.status(401).json({ success: false, message: tokenData.error_description });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();
    let email = userData.email;

    // 3. If email is private, fetch it from the /emails endpoint
    if (!email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const emailsData = await emailResponse.json();
      const primaryEmail = emailsData.find(e => e.primary && e.verified);
      if (primaryEmail) email = primaryEmail.email;
    }

    if (!email) {
       return res.status(400).json({ success: false, message: "Could not retrieve email from GitHub." });
    }

    // 4. Check if user exists or create them
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({
        name: userData.name || userData.login,
        email,
        password: hashedPassword,
      });
    }

    // Generate our app's JWT
    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token: appToken,
    });
    
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
};

// DELETE PROFILE
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all associated data
    await Promise.all([
      Task.deleteMany({ user: userId }),
      IntelligenceReport.deleteMany({ user: userId }),
      IntelligenceHistory.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: "Account and all associated data deleted successfully"
    });

  } catch (error) {
    console.error("Delete Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account. Technical interference detected."
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  githubLogin,
  phoneLogin,
  deleteProfile,
};