// setupVtpass.js - Quick setup script for new Railway database
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Integration from './models/Integration.js';

dotenv.config();

async function setupVtpass() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // VTPass credentials - use static key for all (since it's the only working one)
    const VTPASS_CREDENTIALS = {
      staticKey: "b8bed9a093539a61f851a69ac53cb45e",
      publicKey: "b8bed9a093539a61f851a69ac53cb45e", // Use static key
      secretKey: "b8bed9a093539a61f851a69ac53cb45e"  // Use static key
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
