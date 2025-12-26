import express from "express";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js";
import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";
import Transaction from "../models/Transaction.js";
import Banner from "../models/Banner.js";
import bcrypt from "bcryptjs"; // Using bcryptjs as it's common in node apps, check package.json if unsure but usually synonymous or compatible



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

// ✅ Create a new user manually


router.post("/users", verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "user",
      emailVerified: true // Admins create verified users by default
    });

    await newUser.save();

    res.json({ success: true, message: "User created successfully", user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error creating user");
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

// ✅ Change user role
router.patch("/users/:id/role", verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Prevent modifying self (unless we want to allow admins to demote themselves? unsafe)
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: `User role updated to ${role}`, user: { id: user._id, role: user.role } });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error updating role");
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
});


// ✅ Add new API key
router.post("/api-keys", verifyAdmin, async (req, res) => {
  try {
    const { service, provider, key, createdBy } = req.body;
    const newKey = new ApiKey({ service, provider, key, createdBy });
    await newKey.save();
    const keyMasked = key && key.length > 8 ? `${key.slice(0, 4)}****${key.slice(-4)}` : "****";
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
      keyMasked: typeof k.key === "string" && k.key.length > 8 ? `${k.key.slice(0, 4)}****${k.key.slice(-4)}` : "****",
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

// ✅ Delete user
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deleting other admins
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users. Change role first."
      });
    }

    // Delete user and their transactions
    await Promise.all([
      User.findByIdAndDelete(userId),
      Transaction.deleteMany({ userId })
    ]);

    res.json({
      success: true,
      message: `User ${user.name || user.email} deleted successfully`
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error deleting user");
    res.status(500).json({ success: false, message: "Failed to delete user" });
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

    // 7-Day Chart Data (Daily Volume & Revenue)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const chartData = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: "completed",
          type: { $ne: "credit" } // Exclude wallet funding from revenue charts
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days for the chart
    const fullChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = chartData.find(c => c._id === dateStr);
      fullChartData.push({
        date: dateStr,
        revenue: found ? found.revenue : 0,
        count: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      analytics: {
        today: {
          transactions: todayTransactions,
          revenue: todayRevenue[0]?.total || 0,
          activeUsers,
          successRate: (successCount + failedCount + pendingCount) > 0 ? ((successCount / (successCount + failedCount + pendingCount)) * 100).toFixed(1) : 0
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
        topUsers,
        charts: fullChartData
      }
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching analytics");
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

// 4️⃣ Get Banner Settings
router.get("/banner", verifyAdmin, async (req, res) => {
  try {
    // Return the most recently updated banner or the active one
    const banner = await Banner.findOne().sort({ updatedAt: -1 }); // Singleton-ish behavior
    res.json({ success: true, banner });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error fetching banner");
    res.status(500).json({ success: false, message: "Failed to fetch banner" });
  }
});

// 5️⃣ Update/Set Banner
router.post("/banner", verifyAdmin, async (req, res) => {
  try {
    const { imageUrl, actionUrl, isActive } = req.body;

    // Use a singleton approach: upsert the first document or always create new?
    // Let's keep it simple: Find one and update, or create if none.
    let banner = await Banner.findOne();

    if (banner) {
      banner.imageUrl = imageUrl || banner.imageUrl;
      banner.actionUrl = actionUrl === undefined ? banner.actionUrl : actionUrl;
      banner.isActive = isActive === undefined ? banner.isActive : isActive;
      banner.updatedBy = req.user.name;
    } else {
      banner = new Banner({
        imageUrl,
        actionUrl,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.name
      });
    }

    await banner.save();
    res.json({ success: true, message: "Banner settings updated", banner });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error updating banner");
    res.status(500).json({ success: false, message: "Failed to update banner" });
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

    // Get all three keys from credentials array
    const staticKeyCred = integration.credentials.find(c =>
      c.label && c.label.toLowerCase().includes("static"));
    const publicKeyCred = integration.credentials.find(c =>
      c.label && c.label.toLowerCase().includes("public"));

    const staticKey = staticKeyCred?.value;
    const publicKey = publicKeyCred?.value;

    if (!staticKey || !publicKey) {
      return res.status(400).json({
        success: false,
        message: `Missing credentials. Found: ${integration.credentials.map(c => c.label).join(", ")}`,
        hint: "VTPass requires: Static Key (api-key) and Public Key (PK_...)"
      });
    }

    // Test with VTpass balance endpoint
    // GET requests use: api-key (static) + public-key (PK_)
    const fetch = (await import('node-fetch')).default;

    // Test with service-variations endpoint using correct headers for GET request
    const testResponse = await fetch(`${integration.baseUrl}/service-variations?serviceID=mtn`, {
      method: "GET",
      headers: {
        "api-key": staticKey,      // Static key
        "public-key": publicKey    // PK_ key for GET requests
      }
    });

    const testData = await testResponse.json();

    if (testResponse.ok && testData.code !== "087") {
      res.json({
        success: true,
        message: `✅ VTpass connection successful!`,
        mode: `${integration.mode.toUpperCase()} MODE`,
        balance: "Balance unavailable (credentials limited)",
        testMethod: "Service Variations Check",
        apiResponse: testData.code,
        note: "API connection verified - ready for transactions",
        response: testData
      });
    } else {
      res.status(400).json({
        success: false,
        message: "❌ VTpass connection failed",
        mode: `${integration.mode.toUpperCase()} MODE`,
        error: testData.response_description || testData.content?.errors || testData.message || "Unknown error",
        code: testData.code,
        hint: testData.code === "087" ? "Invalid credentials. Check if keys are activated on VTPass dashboard." : "Connection or API error"
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

// 6️⃣ Edit Transaction (Reference & Status ONLY)
router.patch("/transactions/:id", verifyAdmin, async (req, res) => {
  try {
    const { reference, status, description } = req.body;
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Update allowed fields only
    if (reference) transaction.reference = reference;
    if (status) transaction.status = status;
    if (description) transaction.description = description;

    // Log the edit for audit purposes (optional but good practice)
    transaction.metadata = {
      ...transaction.metadata,
      lastEditedBy: req.user.id,
      lastEditedAt: new Date()
    };

    await transaction.save();

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction: {
        id: transaction._id,
        reference: transaction.reference,
        status: transaction.status,
        description: transaction.description
      }
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "Error updating transaction");
    res.status(500).json({ success: false, message: "Failed to update transaction" });
  }
});

// 7️⃣ One-click setup live credentials
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
