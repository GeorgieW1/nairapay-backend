import mongoose from "mongoose";
import dotenv from "dotenv";
import Integration from "../models/Integration.js";

dotenv.config();

/**
 * Setup Script for Live VTPass and Paystack Credentials
 * 
 * VTPass API Key: b8bed9a093539a61f851a69ac53cb45e
 * Paystack Public Key: PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
 * Paystack Secret Key: SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
 */

const VTPASS_LIVE_CREDENTIALS = {
  staticKey: "b8bed9a093539a61f851a69ac53cb45e",
  publicKey: "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548",
  secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221"
};

const PAYSTACK_LIVE_CREDENTIALS = {
  publicKey: "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548",
  secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221",
};

async function setupLiveCredentials() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // ========================================
    // 1️⃣ SETUP VTPASS INTEGRATIONS (LIVE MODE)
    // ========================================
    console.log("📡 Setting up VTPass Live Integrations...\n");

    // Delete existing VTpass integrations to start fresh
    const deleteResult = await Integration.deleteMany({
      providerName: { $regex: /vtpass/i }
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing VTpass integrations\n`);

    const vtpassIntegrations = [
      {
        providerName: "VTpass",
        category: "airtime",
        baseUrl: "https://vtpass.com/api",
        mode: "live",
        credentials: [
          { label: "Static Key", value: VTPASS_LIVE_CREDENTIALS.staticKey },
          { label: "Public Key", value: VTPASS_LIVE_CREDENTIALS.publicKey },
          { label: "Secret Key", value: VTPASS_LIVE_CREDENTIALS.secretKey }
        ],
        createdBy: "setup_script"
      },
      {
        providerName: "VTpass",
        category: "data",
        baseUrl: "https://vtpass.com/api",
        mode: "live",
        credentials: [
          { label: "Static Key", value: VTPASS_LIVE_CREDENTIALS.staticKey },
          { label: "Public Key", value: VTPASS_LIVE_CREDENTIALS.publicKey },
          { label: "Secret Key", value: VTPASS_LIVE_CREDENTIALS.secretKey }
        ],
        createdBy: "setup_script"
      },
      {
        providerName: "VTpass",
        category: "electricity",
        baseUrl: "https://vtpass.com/api",
        mode: "live",
        credentials: [
          { label: "Static Key", value: VTPASS_LIVE_CREDENTIALS.staticKey },
          { label: "Public Key", value: VTPASS_LIVE_CREDENTIALS.publicKey },
          { label: "Secret Key", value: VTPASS_LIVE_CREDENTIALS.secretKey }
        ],
        createdBy: "setup_script"
      },
      {
        providerName: "VTpass",
        category: "tv",
        baseUrl: "https://vtpass.com/api",
        mode: "live",
        credentials: [
          { label: "Static Key", value: VTPASS_LIVE_CREDENTIALS.staticKey },
          { label: "Public Key", value: VTPASS_LIVE_CREDENTIALS.publicKey },
          { label: "Secret Key", value: VTPASS_LIVE_CREDENTIALS.secretKey }
        ],
        createdBy: "setup_script"
      },
      {
        providerName: "VTpass",
        category: "epin",
        baseUrl: "https://vtpass.com/api",
        mode: "live",
        credentials: [
          { label: "Static Key", value: VTPASS_LIVE_CREDENTIALS.staticKey },
          { label: "Public Key", value: VTPASS_LIVE_CREDENTIALS.publicKey },
          { label: "Secret Key", value: VTPASS_LIVE_CREDENTIALS.secretKey }
        ],
        createdBy: "setup_script"
      }
    ];

    for (const integration of vtpassIntegrations) {
      const created = await Integration.create(integration);
      console.log(`✅ Created VTpass ${integration.category} integration (ID: ${created._id})`);
    }

    console.log("\n✅ All VTpass integrations created successfully!");
    console.log("   - Mode: LIVE");
    console.log("   - Base URL: https://vtpass.com/api");
    console.log("   - Categories: airtime, data, electricity, tv, epin");

    // ========================================
    // 2️⃣ PAYSTACK CREDENTIALS INFO
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("💳 PAYSTACK LIVE CREDENTIALS");
    console.log("=".repeat(60));
    console.log("\n⚠️  IMPORTANT: Add these to your .env file:\n");
    console.log("PAYSTACK_PUBLIC_KEY=" + PAYSTACK_LIVE_CREDENTIALS.publicKey);
    console.log("PAYSTACK_SECRET_KEY=" + PAYSTACK_LIVE_CREDENTIALS.secretKey);
    console.log("\n📝 Also add to Railway/Render environment variables!");

    // ========================================
    // 3️⃣ VERIFICATION
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("🔍 VERIFICATION");
    console.log("=".repeat(60));

    const allIntegrations = await Integration.find({ mode: "live" });
    console.log(`\n✅ Total Live Integrations: ${allIntegrations.length}`);

    for (const integration of allIntegrations) {
      console.log(`   - ${integration.providerName} (${integration.category})`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ SETUP COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Next Steps:");
    console.log("1. Update .env file with Paystack keys");
    console.log("2. Update Railway/Render environment variables");
    console.log("3. Restart your server");
    console.log("4. Test airtime/data purchases");
    console.log("\n🚀 Your backend is now configured for LIVE transactions!\n");

  } catch (error) {
    console.error("❌ Error during setup:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the setup
setupLiveCredentials();
