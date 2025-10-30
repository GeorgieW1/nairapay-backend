import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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
app.use(cors());
app.use(express.json());
app.use("/api/vtpass", vtpassRoutes);

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

    // ✅ API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes); // ✅ place here (after authRoutes)
    app.use("/api/api-keys", apiKeysRoutes);


    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
