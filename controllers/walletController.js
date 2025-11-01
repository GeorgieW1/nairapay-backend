import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

/**
 * Get wallet balance
 */
export const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance");
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      balance: user.walletBalance || 0,
      currency: "NGN",
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Get balance error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Fund wallet
 */
export const fundWallet = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const balanceBefore = user.walletBalance || 0;
    const balanceAfter = balanceBefore + amount;

    // Update wallet balance
    user.walletBalance = balanceAfter;
    await user.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      type: "credit",
      amount,
      status: "completed",
      description: `Wallet funded via ${paymentMethod || "unknown"}`,
      balanceBefore,
      balanceAfter,
      metadata: {
        paymentMethod: paymentMethod || "unknown",
      },
    });

    res.json({
      success: true,
      message: "Wallet funded successfully",
      newBalance: balanceAfter,
      transaction: {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Fund wallet error");
    res.status(500).json({ success: false, error: err.message });
  }
};

