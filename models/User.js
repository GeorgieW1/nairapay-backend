import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // only for manual users
    firebaseUid: { type: String }, // only for Firebase users
    walletBalance: { type: Number, default: 0 },
    walletId: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
