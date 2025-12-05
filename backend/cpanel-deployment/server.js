import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import logger from "./utils/logger.js";
import admin from "firebase-admin";
import connectDB from "./config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import apiKeysRoutes from "./routes/apiKeysRoutes.js";
import vtpassRoutes from "./routes/vtpassRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();

const app = express();
// Structured logging with redaction
app.use(pinoHttp({
	logger,
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"req.body.password",
			"req.body.key",
			"req.body.secret",
			"res.body.token",
			"res.body.key",
			"res.body.secret",
		],
		remove: true,
	},
}));
// Security headers
app.use(helmet());

// CORS - restrict to configured frontend
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Apply JSON parsing, but exclude webhook route (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.path === "/api/wallet/paystack/webhook") {
    return express.raw({ type: "application/json" })(req, res, next);
  }
  return express.json()(req, res, next);
});

// Auth limiter
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

// Sensitive routes limiter
const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/api-keys", sensitiveLimiter);
app.use("/api/vtpass", sensitiveLimiter);
app.use("/api/admin", sensitiveLimiter);

// ✅ Paths setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Firebase Admin SDK (Optional)
let firebaseInitialized = false;
try {
  const serviceAccountPath = "./config/firebaseServiceAccountKey.json";

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log("🔥 Firebase Admin initialized from local service account");
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    firebaseInitialized = true;
    console.log("🔥 Firebase Admin initialized from environment variables");
  } else {
    console.log("⚠️  Firebase not configured - Firebase login will be disabled");
    console.log("   To enable Firebase, set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, and FIREBASE_CLIENT_EMAIL");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error.message);
  console.log("⚠️  Continuing without Firebase - Firebase login will be disabled");
}

// ✅ Make Firebase globally accessible
app.set("firebaseAdmin", admin);
app.set("firebaseInitialized", firebaseInitialized);

// ✅ MongoDB connect and server start
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

// ✅ Serve static admin panel
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve HTML views
app.get("/", (req, res) => {
  res.redirect("/admin");
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/admin/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// Health
app.get("/healthz", (req, res) => res.json({ status: "ok" }));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // ✅ place here (after authRoutes)
app.use("/api/api-keys", apiKeysRoutes);
app.use("/api/vtpass", vtpassRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/data", dataRoutes);

// Initialize server (for non-serverless deployments)
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    // Only listen in non-Vercel environments
    if (!process.env.VERCEL) {
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start server (runs on Railway, Render, etc., but not Vercel)
startServer();

// Export for Vercel serverless
export default app;
