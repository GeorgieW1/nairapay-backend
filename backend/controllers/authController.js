import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import admin from "firebase-admin"; // now available from your server.js initialization
import { sendOTPEmail } from "../services/emailService.js";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

/**
 * Generate 4-digit OTP
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
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

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, error: "This account uses Firebase login. Please use Google sign-in." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role || "user" },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Login error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 🔹 Firebase Authentication Login (Google Sign-in, etc.)
 * Frontend sends { idToken } obtained from Firebase
 */
export const firebaseLogin = async (req, res) => {
  try {
    // Check if Firebase is initialized
    const firebaseInitialized = req.app.get("firebaseInitialized");
    if (!firebaseInitialized) {
      return res.status(503).json({
        error: "Firebase authentication is not configured. Please use email/password login instead."
      });
    }

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
      getJwtSecret(),
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
    const decoded = jwt.verify(token, getJwtSecret());

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

/**
 * 🔹 Forgot Password - Generate reset token
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email });
    // For security, don't reveal if user exists or not
    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent."
      });
    }

    // Check if user has a password (not Firebase-only account)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: "This account uses Firebase login. Please use Google sign-in or reset password via Firebase."
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, type: "password-reset" },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    // In a real app, you'd send this token via email
    // For now, we'll return it in the response (for development/testing)
    // TODO: Implement email sending service
    res.json({
      success: true,
      message: "Password reset token generated",
      resetToken, // Remove this in production - only return in email
      note: "In production, this token should be sent via email"
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Forgot password error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 🔹 Reset Password - Use reset token to set new password
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters"
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, getJwtSecret());
      if (decoded.type !== "password-reset") {
        return res.status(400).json({ success: false, error: "Invalid reset token" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset token" });
    }

    // Find user and update password
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Reset password error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 🔹 Send Email OTP for Verification
 */
export const sendEmailOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email already verified"
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    const emailResult = await sendOTPEmail(user.email, otp, user.fullName || user.name || 'User');

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send OTP email. Please try again later."
      });
    }

    res.json({
      success: true,
      message: "OTP sent to your email"
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Send OTP error");
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 🔹 Verify Email OTP
 */
export const verifyEmailOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: "OTP is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email already verified"
      });
    }

    // Check OTP
    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP"
      });
    }

    // Check expiry
    if (Date.now() > user.emailVerificationExpires) {
      return res.status(400).json({
        success: false,
        error: "OTP expired. Request a new one"
      });
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Verify OTP error");
    res.status(500).json({ success: false, error: error.message });
  }
};