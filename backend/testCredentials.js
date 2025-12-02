// Test VTPass credentials directly
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testCredentials() {
  console.log('🔍 Testing VTPass credentials...\n');

  // Test the exact credentials from setupVtpass.js
  const credentials = [
    {
      name: "Current Setup",
      staticKey: "b8bed9a093539a61f851a69ac53cb45e",
      secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221"
    }
  ];

  for (const cred of credentials) {
    console.log(`\n📡 Testing: ${cred.name}`);
    
    try {
      const response = await fetch('https://vtpass.com/api/service-variations?serviceID=mtn', {
        method: 'GET',
        headers: {
          'api-key': cred.staticKey,
          'secret-key': cred.staticKey // Use static key for both (as in working test)
        }
      });

      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Code: ${data.code}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));

      if (response.ok && data.code !== "087") {
        console.log(`✅ ${cred.name} - WORKING!`);
      } else {
        console.log(`❌ ${cred.name} - FAILED (Code: ${data.code})`);
      }
    } catch (error) {
      console.log(`❌ ${cred.name} - ERROR: ${error.message}`);
    }
  }

  // Test balance endpoint too
  console.log('\n📊 Testing balance endpoint...');
  try {
    const response = await fetch('https://vtpass.com/api/balance', {
      method: 'GET',
      headers: {
        'api-key': "b8bed9a093539a61f851a69ac53cb45e",
        'public-key': "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548"
      }
    });

    const data = await response.json();
    console.log(`Balance Status: ${response.status}`);
    console.log(`Balance Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Balance test error: ${error.message}`);
  }
}

testCredentials();
