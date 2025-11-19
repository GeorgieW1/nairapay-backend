import fetch from "node-fetch";

// VTPass requires 3 keys:
const STATIC_KEY = "b8bed9a093539a61f851a69ac53cb45e";  // No prefix
const PUBLIC_KEY = "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548";  // PK_ prefix
const SECRET_KEY = "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221";  // SK_ prefix

const BASE_URL = "https://vtpass.com/api";

async function testVTPassCorrectly() {
  console.log("🔍 Testing VTPass with CORRECT header format...\n");
  console.log("According to VTPass docs:");
  console.log("- GET requests: api-key (static) + public-key (PK_)");
  console.log("- POST requests: api-key (static) + secret-key (SK_)\n");
  
  // Test 1: GET Balance (correct format)
  console.log("=" .repeat(60));
  console.log("TEST 1: GET Balance with Correct Headers");
  console.log("=" .repeat(60));
  console.log(`URL: ${BASE_URL}/balance`);
  console.log(`Headers:`);
  console.log(`  api-key: ${STATIC_KEY}`);
  console.log(`  public-key: ${PUBLIC_KEY}\n`);
  
  try {
    const response = await fetch(`${BASE_URL}/balance`, {
      method: "GET",
      headers: {
        "api-key": STATIC_KEY,
        "public-key": PUBLIC_KEY
      }
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (data.code === "000" || data.code === 1) {
      console.log("\n✅ ✅ ✅ SUCCESS! VTPass Balance API Works!");
      console.log(`Balance: ₦${data.contents?.balance || data.content?.balance}`);
      return true;
    } else {
      console.log("\n❌ Balance check failed");
      console.log(`Code: ${data.code}`);
      console.log(`Message: ${data.message || data.response_description}`);
      
      if (data.code === "087") {
        console.log("\n⚠️  Error 087 means:");
        console.log("1. Keys are invalid/expired");
        console.log("2. Keys not activated on VTPass dashboard");
        console.log("3. API Authentication Type not set to 'API keys' or 'all'");
        console.log("4. Account not verified");
      }
      return false;
    }
  } catch (error) {
    console.log("\n❌ Request failed:");
    console.log(error.message);
    return false;
  }
}

testVTPassCorrectly();
