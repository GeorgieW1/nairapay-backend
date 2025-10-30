import express from "express";
import { register, login, firebaseLogin, verifyToken } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerValidator, loginValidator, firebaseLoginValidator } from "../validators/authValidators.js";
import User from "../models/User.js"; // 👈 ensure your User model is imported


const router = express.Router();

router.post("/register", registerValidator, validate, register);        // Manual sign up
router.post("/login", loginValidator, validate, login);              // Manual login
router.post("/firebase-login", firebaseLoginValidator, validate, firebaseLogin); // Firebase sign-in (Google, etc.)
router.post("/verify-token", verifyToken); // Verify JWT token for admin dashboard

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
