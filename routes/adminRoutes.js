import express from "express";
import User from "../models/User.js";
import ApiKey from "../models/ApiKey.js"; // ✅ Make sure this file exists (models/ApiKey.js)
import jwt from "jsonwebtoken";
import Integration from "../models/Integration.js";


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Middleware to protect admin routes
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
    res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ Add new API key
router.post("/api-keys", verifyAdmin, async (req, res) => {
  try {
    const { service, provider, key, createdBy } = req.body;
    const newKey = new ApiKey({ service, provider, key, createdBy });
    await newKey.save();
    res.json({ success: true, message: "API Key added successfully", newKey });
  } catch (error) {
    console.error("Error adding key:", error);
    res.status(500).json({ success: false, message: "Failed to add key" });
  }
});

// ✅ Get all API keys
router.get("/api-keys", verifyAdmin, async (req, res) => {
  try {
    const keys = await ApiKey.find().sort({ createdAt: -1 });
    res.json({ success: true, keys });
  } catch (error) {
    console.error("Error fetching keys:", error);
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
    console.error("Error deleting key:", error);
    res.status(500).json({ success: false, message: "Failed to delete key" });
  }
});

export default router;


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
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add integration" });
  }
});

// ✅ Get all integrations
router.get("/integrations", verifyAdmin, async (req, res) => {
  try {
    const integrations = await Integration.find().sort({ createdAt: -1 });
    res.json({ success: true, integrations });
  } catch (err) {
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
    res.status(500).json({ success: false, message: "Failed to delete integration" });
  }
});
