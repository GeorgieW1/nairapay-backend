// setupVtpass.js - Quick setup script for new Railway database
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Integration from './models/Integration.js';

dotenv.config();

async function setupVtpass() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database:', process.env.MONGO_URI?.substring(0, 50) + '...');

    // VTPass credentials - use the correct working credentials
    const VTPASS_CREDENTIALS = {
      staticKey: "b8bed9a093539a61f851a69ac53cb45e",
      publicKey: "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548",
      secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221"
    };

    // Delete old VTpass integrations
    const deleteResult = await Integration.deleteMany({
      providerName: { $regex: /vtpass/i }
    });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old integrations`);

    // Create live integrations
    const categories = ["airtime", "data", "electricity", "tv"];
    const created = [];

    for (const category of categories) {
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
        createdBy: "admin"
      });
      created.push(integration);
      console.log(`✅ Created ${category} integration`);
    }

    console.log(`\n🎉 Setup complete! Created ${created.length} VTPass integrations`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupVtpass();
