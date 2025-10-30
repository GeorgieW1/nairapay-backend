import express from "express";
import Integration from "../models/Integration.js";
import fetch from "node-fetch";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧪 Test Airtime Purchase (admin only, disabled in production)
router.post("/airtime/test", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    // 1️⃣ Get integration credentials from DB
    const vtpass = await Integration.findOne({ providerName: "VTpass", mode: "sandbox" });
    if (!vtpass) {
      return res.status(404).json({ success: false, message: "VTpass sandbox integration not found" });
    }

    // 2️⃣ Extract keys
    const apiKey = vtpass.credentials.find(c => c.label.toLowerCase().includes("api"))?.value;
    const publicKey = vtpass.credentials.find(c => c.label.toLowerCase().includes("public"))?.value;
    const secretKey = vtpass.credentials.find(c => c.label.toLowerCase().includes("secret"))?.value;

    if (!publicKey || !secretKey) {
      return res.status(400).json({ success: false, message: "Missing VTpass credentials" });
    }

    // 3️⃣ Prepare sandbox test data
    const testData = {
      request_id: "test_" + Date.now(),
      serviceID: "mtn",
      amount: "100",
      phone: "08111111111"
    };

    // 4️⃣ Send to VTpass sandbox
    const response = await fetch(`${vtpass.baseUrl}/pay`, {
      method: "POST",
      headers: {
        "api-key": apiKey || "", // some sandbox use "null"
        "public-key": publicKey,
        "secret-key": secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();

    res.json({
      success: true,
      message: "Airtime test sent to VTpass sandbox",
      vtpassResponse: data,
    });
  } catch (error) {
    if (req.log) req.log.error({ err: error }, "VTpass Test Error");
    res.status(500).json({ success: false, message: "Error testing VTpass sandbox" });
  }
});

export default router;
