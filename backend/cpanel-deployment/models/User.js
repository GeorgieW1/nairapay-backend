import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    fullName: { type: String }, // Full name for personalized emails
    email: { type: String, unique: true, required: true },
    phone: { type: String }, // Phone number for notifications
    password: { type: String }, // only for manual users
    firebaseUid: { type: String }, // only for Firebase users
    walletBalance: { type: Number, default: 0 },
    walletId: { type: String },
    role: { type: String, default: "user" },

    // Email Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String },
    emailVerificationExpires: { type: Date },

    // Push Notifications (FCM)
    fcmToken: { type: String },
    deviceType: { type: String, enum: ['android', 'ios', 'web'] },
    fcmTokenUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
