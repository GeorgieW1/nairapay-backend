import fetch from "node-fetch";

const VTPASS_SECRET_KEY = "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221";
const BASE_URL = "https://vtpass.com/api";

async function testWithSecretKey() {
  console.log("🔍 Testing VTPass with SECRET KEY...\n");
  console.log(`URL: ${BASE_URL}/balance`);
  console.log(`Secret Key: ${VTPASS_SECRET_KEY}\n`);
  
  try {
    const response = await fetch(`${BASE_URL}/balance`, {
      method: "GET",
      headers: {
        "api-key": VTPASS_SECRET_KEY,
        "secret-key": VTPASS_SECRET_KEY
      }
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`\nResponse:`, JSON.stringify(data, null, 2));
    
    if (data.code === "000") {
      console.log("\n✅ ✅ ✅ SECRET KEY WORKS!");
      console.log(`Balance: ${data.contents?.balance || data.content?.balance}`);
    } else {
      console.log("\n❌ Secret key failed");
      console.log(`Code: ${data.code}`);
      console.log(`Message: ${data.message || data.response_description}`);
    }
  } catch (error) {
    console.log("\n❌ Request failed:");
    console.log(error.message);
  }
}

testWithSecretKey();
