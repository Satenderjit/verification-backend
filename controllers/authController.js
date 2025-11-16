// controllers/authController.js
const User = require("../models/User");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // 2. Check if the submitted password matches the hashed password
    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      // In a real application, you would generate a JWT here
      return res.json({ 
        message: "Login successful", 
        success: true,
      });
    } else {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// --- Helper Route to easily create the first Admin account ---
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Admin account already exists" });
    }

    // Create and save the new admin user (password will be hashed by middleware)
    user = await User.create({ email, password });

    res.status(201).json({ 
        message: "Admin account created successfully. You can now login.",
        success: true
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

module.exports = { loginAdmin, registerAdmin };