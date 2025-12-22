import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseInitialized = false;

try {
    // Check if already initialized (prevent duplicate init errors)
    if (admin.apps.length > 0) {
        firebaseInitialized = true;
        console.log("✅ Firebase already initialized");
    } else {
        const serviceAccountPath = path.join(__dirname, "firebaseServiceAccountKey.json");

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
            console.log("⚠️  Firebase not configured - Firebase features will be disabled");
            console.log("   To enable Firebase, set FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, and FIREBASE_CLIENT_EMAIL");
        }
    }
} catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    console.log("⚠️  Continuing without Firebase - Firebase features will be disabled");
}

export { admin, firebaseInitialized };
