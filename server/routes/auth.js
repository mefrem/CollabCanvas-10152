import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Generate random cursor color
const generateCursorColor = () => {
  const colors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#F97316", // orange
    "#EC4899", // pink
    "#6B7280", // gray
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      username,
      color: generateCursorColor(),
    });

    await user.save();

    // Log user in automatically
    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Login after registration failed" });
      }

      const userResponse = {
        id: user._id,
        email: user.email,
        username: user.username,
        color: user.color,
      };

      res
        .status(201)
        .json({ message: "User created successfully", user: userResponse });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Server error during login" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }

      const userResponse = {
        id: user._id,
        email: user.email,
        username: user.username,
        color: user.color,
      };

      res.json({ message: "Login successful", user: userResponse });
    });
  })(req, res, next);
});

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

// Get current user
router.get("/me", requireAuth, (req, res) => {
  const userResponse = {
    id: req.user._id,
    email: req.user.email,
    username: req.user.username,
    color: req.user.color,
  };
  res.json(userResponse);
});

export default router;
