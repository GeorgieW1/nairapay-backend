import fetch from "node-fetch";

const API_KEY = "b8bed9a093539a61f851a69ac53cb45e";
const BASE_URL = "https://vtpass.com/api";

async function testBalance() {
  console.log("🔍 Testing VTPass Balance Endpoint...\n");
  console.log(`URL: ${BASE_URL}/balance`);
  console.log(`API Key: ${API_KEY}\n`);
  
  try {
    const response = await fetch(`${BASE_URL}/balance`, {
      method: "GET",
      headers: {
        "api-key": API_KEY,
        "secret-key": API_KEY
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log(`\nResponse:`, JSON.stringify(data, null, 2));
    
    if (data.code === "000") {
      console.log("\n✅ Balance endpoint works!");
      console.log(`Balance: ${data.contents?.balance || data.content?.balance}`);
    } else {
      console.log("\n❌ Balance endpoint returned error");
      console.log(`Code: ${data.code}`);
      console.log(`Message: ${data.response_description || data.message}`);
    }
  } catch (error) {
    console.log("\n❌ Request failed:");
    console.log(error.message);
  }
}

testBalance();
