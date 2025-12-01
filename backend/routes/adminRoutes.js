import express from "express";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js"; // ✅ Make sure this file exists (models/ApiKey.js)
import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";
import Transaction from "../models/Transaction.js";


const router = express.Router();
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return secret;
};

// ✅ Middleware to protect admin routes
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

// ✅ Get all users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json({ success: true, users });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching users");
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// ✅ Fund a user's wallet
router.post("/users/:id/fund", verifyAdmin, async (req, res) => {
  try {
    const { amount, note } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const [user, adminUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(req.user?.id).select("email name"),
    ]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const balanceBefore = user.walletBalance || 0;
    const balanceAfter = balanceBefore + parsedAmount;

    user.walletBalance = balanceAfter;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: "credit",
      amount: parsedAmount,
      status: "completed",
      description: note?.trim() || "Wallet funded by admin",
      balanceBefore,
      balanceAfter,
      metadata: {
        source: "admin_panel",
        action: "admin_wallet_funding",
        initiatedBy: req.user?.id,
        adminEmail: adminUser?.email,
        adminName: adminUser?.name,
      },
    });

    res.json({
      success: true,
      message: "Wallet funded successfully",
      walletBalance: balanceAfter,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error funding wallet");
    res.status(500).json({ success: false, message: "Failed to fund wallet" });
  }
});


// ✅ Add new API key
router.post("/api-keys", verifyAdmin, async (req, res) => {
  try {
    const { service, provider, key, createdBy } = req.body;
    const newKey = new ApiKey({ service, provider, key, createdBy });
    await newKey.save();
    const keyMasked = key && key.length > 8 ? `${key.slice(0,4)}****${key.slice(-4)}` : "****";
    res.json({ success: true, message: "API Key added successfully", keyMasked });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error adding key");
    res.status(500).json({ success: false, message: "Failed to add key" });
  }
});

// ✅ Get all API keys
router.get("/api-keys", verifyAdmin, async (req, res) => {
  try {
    const keys = await ApiKey.find().sort({ createdAt: -1 });
    const masked = keys.map(k => ({
      _id: k._id,
      service: k.service,
      provider: k.provider,
      createdBy: k.createdBy,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      keyMasked: typeof k.key === "string" && k.key.length > 8 ? `${k.key.slice(0,4)}****${k.key.slice(-4)}` : "****",
    }));
    res.json({ success: true, keys: masked });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching keys");
    res.status(500).json({ success: false, message: "Failed to load keys" });
  }
});

// ✅ Delete an API key
router.delete("/api-keys/:id", verifyAdmin, async (req, res) => {
  try {
    const key = await ApiKey.findByIdAndDelete(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, message: "Key not found" });
    }
    res.json({ success: true, message: "API Key deleted successfully" });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error deleting key");
    res.status(500).json({ success: false, message: "Failed to delete key" });
  }
});

// ✅ Add new integration
router.post("/integrations", verifyAdmin, async (req, res) => {
  try {
    const { providerName, category, baseUrl, mode, credentials } = req.body;
    const integration = new Integration({
      providerName,
      category,
      baseUrl,
      mode,
      credentials,
      createdBy: req.user.name || "admin",
    });
    await integration.save();
    res.json({ success: true, message: "Integration added", integration });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Failed to add integration");
    res.status(500).json({ success: false, message: "Failed to add integration" });
  }
});

// ✅ Get all integrations
router.get("/integrations", verifyAdmin, async (req, res) => {
  try {
    const integrations = await Integration.find().sort({ createdAt: -1 });
    const masked = integrations.map((i) => ({
      _id: i._id,
      providerName: i.providerName,
      category: i.category,
      baseUrl: i.baseUrl,
      mode: i.mode,
      createdBy: i.createdBy,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      credentials: Array.isArray(i.credentials)
        ? i.credentials.map((c) => ({
            label: c.label,
            valueMasked: typeof c.value === "string" && c.value.length > 8
              ? `${c.value.slice(0, 4)}****${c.value.slice(-4)}`
              : "****",
          }))
        : [],
    }));
    res.json({ success: true, integrations: masked });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Failed to load integrations");
    res.status(500).json({ success: false, message: "Failed to load integrations" });
  }
});

// ✅ Delete integration
router.delete("/integrations/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await Integration.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Integration not found" });
    res.json({ success: true, message: "Integration deleted" });
  } catch (err) {
    if (req.log) req.log.error({ err }, "Failed to delete integration");
    res.status(500).json({ success: false, message: "Failed to delete integration" });
  }
});

// ===== NEW ADMIN FEATURES =====

// 1️⃣ Get all transactions with filters
router.get("/transactions", verifyAdmin, async (req, res) => {
  try {
    const { type, status, userId, startDate, endDate, search, limit = 50, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Search by description or phone
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Transaction.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching transactions");
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

// 2️⃣ Deduct from user wallet
router.post("/users/:id/deduct", verifyAdmin, async (req, res) => {
  try {
    const { amount, note } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const [user, adminUser] = await Promise.all([
      User.findById(req.params.id),
      User.findById(req.user?.id).select("email name"),
    ]);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const balanceBefore = user.walletBalance || 0;
    
    // Check if user has sufficient balance
    if (balanceBefore < parsedAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        currentBalance: balanceBefore
      });
    }
    
    const balanceAfter = balanceBefore - parsedAmount;

    user.walletBalance = balanceAfter;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: "debit",
      amount: parsedAmount,
      status: "completed",
      description: note?.trim() || "Wallet deduction by admin",
      balanceBefore,
      balanceAfter,
      metadata: {
        source: "admin_panel",
        action: "admin_wallet_deduction",
        initiatedBy: req.user?.id,
        adminEmail: adminUser?.email,
        adminName: adminUser?.name,
      },
    });

    res.json({
      success: true,
      message: "Wallet deducted successfully",
      walletBalance: balanceAfter,
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error deducting from wallet");
    res.status(500).json({ success: false, message: "Failed to deduct from wallet" });
  }
});

// 3️⃣ Dashboard Analytics
router.get("/analytics", verifyAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Today's stats
    const [todayTransactions, todayRevenue, monthTransactions, monthRevenue, totalUsers, activeUsers] = await Promise.all([
      Transaction.countDocuments({
        createdAt: { $gte: todayStart },
        status: "completed"
      }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: todayStart }, status: "completed", type: { $ne: "credit" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.countDocuments({
        createdAt: { $gte: monthStart },
        status: "completed"
      }),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: monthStart }, status: "completed", type: { $ne: "credit" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: todayStart } })
    ]);
    
    // Transaction success/failure rates
    const [successCount, failedCount, pendingCount] = await Promise.all([
      Transaction.countDocuments({ createdAt: { $gte: todayStart }, status: "completed" }),
      Transaction.countDocuments({ createdAt: { $gte: todayStart }, status: "failed" }),
      Transaction.countDocuments({ createdAt: { $gte: todayStart }, status: "pending" })
    ]);
    
    // Revenue by service type
    const serviceRevenue = await Transaction.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: "completed", type: { $ne: "credit" } } },
      { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    
    // Top users by spending
    const topUsers = await Transaction.aggregate([
      { $match: { createdAt: { $gte: monthStart }, status: "completed", type: { $ne: "credit" } } },
      { $group: { _id: "$userId", totalSpent: { $sum: "$amount" }, transactionCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { name: "$user.name", email: "$user.email", totalSpent: 1, transactionCount: 1 } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        today: {
          transactions: todayTransactions,
          revenue: todayRevenue[0]?.total || 0,
          activeUsers,
          successRate: todayTransactions > 0 ? ((successCount / (successCount + failedCount + pendingCount)) * 100).toFixed(1) : 0
        },
        month: {
          transactions: monthTransactions,
          revenue: monthRevenue[0]?.total || 0,
          totalUsers
        },
        transactionStats: {
          completed: successCount,
          failed: failedCount,
          pending: pendingCount
        },
        serviceBreakdown: serviceRevenue.map(s => ({
          type: s._id,
          revenue: s.total,
          count: s.count,
          percentage: monthRevenue[0]?.total ? ((s.total / monthRevenue[0].total) * 100).toFixed(1) : 0
        })),
        topUsers
      }
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching analytics");
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

// 🔍 Debug: Check VTPass integrations in database
router.get("/integrations/debug-vtpass", verifyAdmin, async (req, res) => {
  try {
    const integrations = await Integration.find({
      providerName: { $regex: /vtpass/i }
    });
    
    const masked = integrations.map(i => ({
      _id: i._id,
      category: i.category,
      mode: i.mode,
      baseUrl: i.baseUrl,
      credentialLabels: i.credentials.map(c => c.label),
      hasStaticKey: i.credentials.some(c => c.label?.toLowerCase().includes("static")),
      hasPublicKey: i.credentials.some(c => c.label?.toLowerCase().includes("public")),
      hasSecretKey: i.credentials.some(c => c.label?.toLowerCase().includes("secret"))
    }));
    
    res.json({
      success: true,
      count: integrations.length,
      integrations: masked
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4️⃣ Test VTpass Connection
router.post("/integrations/test-vtpass", verifyAdmin, async (req, res) => {
  try {
    // Find VTpass integration (prioritize live mode)
    let integration = await Integration.findOne({
      providerName: { $regex: /vtpass/i },
      mode: "live"
    });
    
    if (!integration) {
      integration = await Integration.findOne({
        providerName: { $regex: /vtpass/i },
        mode: "sandbox"
      });
    }
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: "VTpass integration not found. Please setup VTpass credentials first."
      });
    }
    
    // Get static key from credentials array
    const staticKeyCred = integration.credentials.find(c => 
      c.label && c.label.toLowerCase().includes("static"));
    
    const staticKey = staticKeyCred?.value;
    
    if (!staticKey) {
      return res.status(400).json({
        success: false,
        message: `Missing Static Key. Found: ${integration.credentials.map(c => c.label).join(", ")}`,
        hint: "VTPass requires at least a Static Key (api-key)"
      });
    }
    
    // Test with VTpass service-variations endpoint (same as working test script)
    // Use api-key and secret-key headers (both can be the static key for GET requests)
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${integration.baseUrl}/service-variations?serviceID=mtn`, {
      method: "GET",
      headers: {
        "api-key": staticKey,
        "secret-key": staticKey
      }
    });
    
    const data = await response.json();
    
    // VTPass connection is successful if we get a 200 response
    // Code "011" means "No Variations" which is fine - it means API is working
    // Code "000" means successful transaction
    // Code "087" means invalid credentials
    if (response.ok && data.code !== "087") {
      res.json({
        success: true,
        message: `✅ VTpass connection successful!`,
        mode: integration.mode,
        apiResponse: data.code,
        response: data
      });
    } else {
      res.status(400).json({
        success: false,
        message: "VTpass connection failed",
        error: data.response_description || data.content?.errors || data.message || "Unknown error",
        code: data.code,
        hint: data.code === "087" ? "Invalid credentials. Check if keys are activated on VTPass dashboard." : undefined
      });
    }
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error testing VTpass");
    res.status(500).json({
      success: false,
      message: "Failed to test VTpass connection",
      error: error.message
    });
  }
});

// 5️⃣ Get transaction details
router.get("/transactions/:id", verifyAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('userId', 'name email phone');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    
    res.json({ success: true, transaction });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching transaction");
    res.status(500).json({ success: false, message: "Failed to fetch transaction" });
  }
});

// 6️⃣ One-click setup live credentials
router.post("/integrations/setup-live", verifyAdmin, async (req, res) => {
  try {
    const VTPASS_CREDENTIALS = {
      staticKey: "b8bed9a093539a61f851a69ac53cb45e",
      publicKey: "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548",
      secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221"
    };
    
    // Delete old VTpass integrations
    const deleteResult = await Integration.deleteMany({
      providerName: { $regex: /vtpass/i }
    });
    
    // Create live integrations
    const categories = ["airtime", "data", "electricity", "tv"];
    const created = [];
    const errors = [];
    
    for (const category of categories) {
      try {
        const integration = await Integration.create({
          providerName: "VTpass",
          category,
          baseUrl: "https://vtpass.com/api",
          mode: "live",
          credentials: [
            { label: "Static Key", value: VTPASS_CREDENTIALS.staticKey },
            { label: "Public Key", value: VTPASS_CREDENTIALS.publicKey },
            { label: "Secret Key", value: VTPASS_CREDENTIALS.secretKey }
          ],
          createdBy: req.user.name || "admin"
        });
        created.push(integration);
      } catch (err) {
        errors.push({ category, error: err.message });
      }
    }
    
    res.json({
      success: created.length > 0,
      message: `✅ Setup complete! Deleted ${deleteResult.deletedCount} old integrations, created ${created.length} live integrations`,
      integrations: created.map(i => ({ category: i.category, mode: i.mode })),
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error setting up live credentials");
    res.status(500).json({ success: false, message: "Failed to setup live credentials", error: error.message });
  }
});

export default router;
