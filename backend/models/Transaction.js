import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit", "airtime", "data", "electricity", "tv", "epin", "betting"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // For wallet transactions
    balanceBefore: Number,
    balanceAfter: Number,
    // For service purchases
    serviceProvider: String,
    phoneNumber: String,
    network: String,
    plan: String,
    meterNumber: String,
    meterType: String,
    // For TV subscriptions
    smartcardNumber: String,
    tvProvider: String,
    bouquet: String,
    // For E-pins
    epinCategory: String,
    pins: [String], // Encrypted e-pins
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

export default mongoose.model("Transaction", transactionSchema);











