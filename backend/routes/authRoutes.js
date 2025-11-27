import express from "express";
import jwt from "jsonwebtoken";
import { register, login, firebaseLogin, verifyToken, forgotPassword, resetPassword, sendEmailOTP, verifyEmailOTP } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerValidator, loginValidator, firebaseLoginValidator, forgotPasswordValidator, resetPasswordValidator } from "../validators/authValidators.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // 👈 ensure your User model is imported


const router = express.Router();

router.post("/register", registerValidator, validate, register);        // Manual sign up
router.post("/login", loginValidator, validate, login);              // Manual login
router.post("/firebase-login", firebaseLoginValidator, validate, firebaseLogin); // Firebase sign-in (Google, etc.)
router.post("/verify-token", verifyToken); // Verify JWT token / Get current user (acts as /api/auth/me)
// GET /api/auth/me - Get current user (alias for verify-token)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword); // Request password reset
router.post("/reset-password", resetPasswordValidator, validate, resetPassword); // Reset password with token

// Email OTP Verification
router.post("/send-otp", protect, sendEmailOTP); // Send email verification OTP
router.post("/verify-otp", protect, verifyEmailOTP); // Verify email OTP

// ✅ New route: Get all users
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching users");
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

export default router;
