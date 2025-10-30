import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import admin from "firebase-admin"; // now available from your server.js initialization

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

/**
 * 🔹 Manual Registration (optional)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // prevent duplicate users
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * 🔹 Manual Login (optional)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔹 Firebase Authentication Login (Google Sign-in, etc.)
 * Frontend sends { idToken } obtained from Firebase
 */
export const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Firebase ID token is required" });
    }

    // ✅ Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    // ✅ Check if user exists in DB or create one
    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        role: "user",
      });
    }

    // ✅ Create backend JWT for internal use
    const backendToken = jwt.sign(
      {
        id: user._id,
        firebaseUid: decoded.uid,
        role: user.role,
        walletId: user.walletId || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: backendToken,
      user,
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Firebase login error");
    res.status(401).json({ error: "Invalid or expired Firebase token" });
  }
};
  

export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Get the token from "Bearer <token>"
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Token verification failed");
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};