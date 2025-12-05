import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { initializePayment, verifyPayment, verifyWebhookSignature } from "../utils/paystack.js";

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

/**
 * Initialize Paystack payment for wallet funding
 */
export const initializePaystackPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    // Minimum amount check (Paystack minimum is usually 100 kobo = 1 Naira)
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: "Minimum amount is ₦1",
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        error: "User email is required for payment",
      });
    }

    // Generate unique reference
    const reference = `WALLET_${user._id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create pending transaction
    const balanceBefore = user.walletBalance || 0;
    const transaction = await Transaction.create({
      userId: user._id,
      type: "credit",
      amount,
      status: "pending",
      description: `Wallet funding via Paystack`,
      balanceBefore,
      metadata: {
        paymentMethod: "paystack",
        reference,
        paymentProvider: "paystack",
      },
    });

    try {
      // Initialize Paystack payment
      const paymentData = await initializePayment({
        amount,
        email: user.email,
        reference,
        metadata: {
          userId: user._id.toString(),
          transactionId: transaction._id.toString(),
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user._id.toString(),
            },
            {
              display_name: "Transaction ID",
              variable_name: "transaction_id",
              value: transaction._id.toString(),
            },
          ],
        },
      });

      // Update transaction with payment reference
      transaction.metadata.paystackReference = paymentData.reference;
      transaction.metadata.authorizationUrl = paymentData.authorization_url;
      await transaction.save();

      res.json({
        success: true,
        message: "Payment initialized successfully",
        authorization_url: paymentData.authorization_url,
        access_code: paymentData.access_code,
        reference: paymentData.reference,
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
        },
      });
    } catch (paymentError) {
      // Mark transaction as failed
      transaction.status = "failed";
      transaction.metadata.error = paymentError.message;
      await transaction.save();

      if (req.log) req.log.error({ err: paymentError }, "Paystack initialization error");
      res.status(500).json({
        success: false,
        error: "Failed to initialize payment",
        details: paymentError.message,
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Initialize Paystack payment error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Verify Paystack payment (callback/webhook)
 */
export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "Payment reference is required",
      });
    }

    // Log verification attempt
    if (req.log) req.log.info({ reference }, "Verifying Paystack payment");

    // Find transaction by reference (check both fields)
    const transaction = await Transaction.findOne({
      $or: [
        { "metadata.reference": reference },
        { "metadata.paystackReference": reference }
      ]
    }).populate("userId");

    if (!transaction) {
      if (req.log) req.log.error({ reference }, "Transaction not found for verification");
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    if (req.log) req.log.info({ 
      transactionId: transaction._id, 
      currentStatus: transaction.status,
      reference 
    }, "Transaction found for verification");

    // If already completed, return success
    if (transaction.status === "completed") {
      return res.json({
        success: true,
        message: "Payment already verified",
        transaction: {
          _id: transaction._id,
          amount: transaction.amount,
          status: transaction.status,
        },
      });
    }

    try {
      // Verify payment with Paystack
      const verification = await verifyPayment(reference);
      
      if (req.log) req.log.info({ 
        reference, 
        verificationStatus: verification.status,
        verificationSuccess: verification.success 
      }, "Paystack verification response");

      if (verification.success && verification.status === "success") {
        const user = await User.findById(transaction.userId._id || transaction.userId);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }

        // Update wallet balance
        const balanceBefore = user.walletBalance || 0;
        const balanceAfter = balanceBefore + transaction.amount;

        user.walletBalance = balanceAfter;
        await user.save();

        // Update transaction
        transaction.status = "completed";
        transaction.balanceAfter = balanceAfter;
        transaction.metadata.paystackVerification = verification;
        transaction.metadata.paidAt = verification.paidAt;
        await transaction.save();

        if (req.log) req.log.info({ 
          transactionId: transaction._id,
          userId: user._id,
          amount: transaction.amount,
          newBalance: balanceAfter 
        }, "Payment verified and wallet updated successfully");

        res.json({
          success: true,
          message: "Payment verified successfully",
          transaction: {
            _id: transaction._id,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            balanceAfter,
          },
          newBalance: balanceAfter,
        });
      } else {
        // Payment not successful
        transaction.status = "failed";
        transaction.metadata.verificationError = verification.message || "Payment verification failed";
        await transaction.save();

        res.status(400).json({
          success: false,
          error: "Payment verification failed",
          message: verification.message || "Payment was not successful",
          transaction: {
            _id: transaction._id,
            status: transaction.status,
          },
        });
      }
    } catch (verificationError) {
      transaction.status = "failed";
      transaction.metadata.verificationError = verificationError.message;
      await transaction.save();

      if (req.log) req.log.error({ err: verificationError }, "Paystack verification error");
      res.status(500).json({
        success: false,
        error: "Failed to verify payment",
        details: verificationError.message,
      });
    }
  } catch (err) {
    if (req.log) req.log.error({ err }, "Verify Paystack payment error");
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Handle Paystack webhook
 */
export const handlePaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Paystack signature",
      });
    }

    // Parse raw body (webhook uses raw JSON)
    // Handle both Buffer (from express.raw) and parsed JSON
    let body;
    let rawBodyForVerification;
    
    if (Buffer.isBuffer(req.body)) {
      rawBodyForVerification = req.body;
      body = JSON.parse(req.body.toString());
    } else if (typeof req.body === "string") {
      rawBodyForVerification = req.body;
      body = JSON.parse(req.body);
    } else {
      body = req.body;
      rawBodyForVerification = JSON.stringify(body);
    }

    // Verify webhook signature (use raw body for verification)
    const isValid = verifyWebhookSignature(signature, rawBodyForVerification);

    if (!isValid) {
      if (req.log) req.log.warn("Invalid Paystack webhook signature");
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const event = body;

    // Handle different event types
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      // Find transaction (check both fields)
      const transaction = await Transaction.findOne({
        $or: [
          { "metadata.reference": reference },
          { "metadata.paystackReference": reference }
        ]
      }).populate("userId");

      if (!transaction) {
        if (req.log) req.log.warn({ reference }, "Transaction not found for webhook");
        return res.status(404).json({
          success: false,
          error: "Transaction not found",
        });
      }

      // If already completed, just acknowledge
      if (transaction.status === "completed") {
        return res.json({ success: true, message: "Already processed" });
      }

      const user = await User.findById(transaction.userId._id || transaction.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Update wallet balance
      const balanceBefore = user.walletBalance || 0;
      const balanceAfter = balanceBefore + transaction.amount;

      user.walletBalance = balanceAfter;
      await user.save();

      // Update transaction
      transaction.status = "completed";
      transaction.balanceAfter = balanceAfter;
      transaction.metadata.paystackWebhook = event.data;
      transaction.metadata.paidAt = event.data.paid_at;
      await transaction.save();

      if (req.log) req.log.info({ transactionId: transaction._id, reference }, "Payment completed via webhook");

      return res.json({
        success: true,
        message: "Webhook processed successfully",
      });
    }

    // Acknowledge other events
    res.json({ success: true, message: "Event received" });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Paystack webhook error");
    res.status(500).json({ success: false, error: err.message });
  }
};










