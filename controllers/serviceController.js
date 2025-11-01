import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import ApiKey from "../models/ApiKey.js";
import Integration from "../models/Integration.js";

/**
 * Buy Airtime
 */
export const buyAirtime = async (req, res) => {
  try {
    const { phone, network, amount } = req.body;

    // Validation
    if (!phone || !network || !amount) {
      return res.status(400).json({
        success: false,
        error: "Phone, network, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Get user and check balance
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient wallet balance",
      });
    }

    // Get VTpass integration
    const integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      category: "airtime",
    });

    if (!integration) {
      return res.status(503).json({
        success: false,
        error: "Airtime service not configured",
      });
    }

    // Get API key for airtime
    const apiKey = await ApiKey.findOne({ service: "airtime" });
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: "Airtime API key not configured",
      });
    }

    // Create pending transaction
    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "airtime",
      amount,
      status: "pending",
      description: `Airtime purchase - ${network} ${phone}`,
      balanceBefore,
      metadata: {
        phone,
        network,
        provider: integration.providerName,
      },
    });

    try {
      // Call VTpass API (you'll need to implement this based on VTpass docs)
      // For now, simulating success
      const vtpassResponse = {
        code: "000",
        message: "Airtime purchase successful",
      };

      // If successful, deduct from wallet
      user.walletBalance = balanceBefore - amount;
      await user.save();

      // Update transaction
      transaction.status = "completed";
      transaction.balanceAfter = user.walletBalance;
      transaction.metadata.vtpassResponse = vtpassResponse;
      await transaction.save();

      res.json({
        success: true,
        message: "Airtime purchased successfully",
        transaction: {
          _id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          phone,
          network,
        },
        newBalance: user.walletBalance,
      });
    } catch (serviceError) {
      // If service call fails, mark transaction as failed
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process airtime purchase",
        transaction: {
          _id: transaction._id,
          status: "failed",
        },
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Buy airtime error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Buy Data
 */
export const buyData = async (req, res) => {
  try {
    const { phone, network, dataPlan, amount } = req.body;

    if (!phone || !network || !dataPlan || !amount) {
      return res.status(400).json({
        success: false,
        error: "Phone, network, dataPlan, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient wallet balance",
      });
    }

    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "data",
      amount,
      status: "pending",
      description: `Data purchase - ${network} ${dataPlan} for ${phone}`,
      balanceBefore,
      metadata: {
        phone,
        network,
        dataPlan,
      },
    });

    try {
      // Simulate successful data purchase
      user.walletBalance = balanceBefore - amount;
      await user.save();

      transaction.status = "completed";
      transaction.balanceAfter = user.walletBalance;
      await transaction.save();

      res.json({
        success: true,
        message: "Data purchased successfully",
        transaction: {
          _id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          phone,
          network,
          dataPlan,
        },
        newBalance: user.walletBalance,
      });
    } catch (serviceError) {
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process data purchase",
        transaction: {
          _id: transaction._id,
          status: "failed",
        },
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Buy data error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Pay Electricity
 */
export const payElectricity = async (req, res) => {
  try {
    const { meterNumber, meterType, provider, amount } = req.body;

    if (!meterNumber || !meterType || !provider || !amount) {
      return res.status(400).json({
        success: false,
        error: "Meter number, meter type, provider, and amount are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient wallet balance",
      });
    }

    const balanceBefore = user.walletBalance;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "electricity",
      amount,
      status: "pending",
      description: `Electricity bill payment - ${provider} ${meterNumber}`,
      balanceBefore,
      metadata: {
        meterNumber,
        meterType,
        provider,
      },
    });

    try {
      // Simulate successful payment
      user.walletBalance = balanceBefore - amount;
      await user.save();

      transaction.status = "completed";
      transaction.balanceAfter = user.walletBalance;
      await transaction.save();

      res.json({
        success: true,
        message: "Electricity bill paid successfully",
        transaction: {
          _id: transaction._id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          meterNumber,
          provider,
        },
        newBalance: user.walletBalance,
      });
    } catch (serviceError) {
      transaction.status = "failed";
      transaction.metadata.error = serviceError.message;
      await transaction.save();

      res.status(500).json({
        success: false,
        error: "Failed to process electricity payment",
        transaction: {
          _id: transaction._id,
          status: "failed",
        },
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Pay electricity error");
    res.status(500).json({ success: false, error: err.message });
  }
};

