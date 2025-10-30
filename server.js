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

app.use(express.json());

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

// ✅ Initialize Firebase Admin SDK
try {
  const serviceAccountPath = "./config/firebaseServiceAccountKey.json";

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin initialized from local service account");
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔥 Firebase Admin initialized from environment variables");
  } else {
    throw new Error("Firebase configuration not found");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization failed:", error);
  process.exit(1);
}

// ✅ Make Firebase globally accessible
app.set("firebaseAdmin", admin);

// ✅ MongoDB connect and server start
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    // ✅ Serve static admin panel
    app.use(express.static(path.join(__dirname, "public")));

    // ✅ Serve HTML views
    app.get("/admin", (req, res) => {
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


    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
