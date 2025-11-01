import express from "express";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js"; // ✅ Make sure this file exists (models/ApiKey.js)
import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";


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

export default router;
