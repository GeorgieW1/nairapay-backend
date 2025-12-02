import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Integration from './models/Integration.js';

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    const integrations = await Integration.find({
      providerName: { $regex: /vtpass/i }
    });

    console.log(`Found ${integrations.length} VTPass integrations:\n`);

    for (const integration of integrations) {
      console.log(`📋 ${integration.category} (${integration.mode})`);
      console.log(`   Base URL: ${integration.baseUrl}`);
      console.log(`   Credentials:`);
      
      for (const cred of integration.credentials) {
        const value = cred.value;
        const maskedValue = value.length > 10 
          ? value.substring(0, 10) + '...' + value.substring(value.length - 6)
          : value;
        console.log(`     ${cred.label}: ${maskedValue}`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
