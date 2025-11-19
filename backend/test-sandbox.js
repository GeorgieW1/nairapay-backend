import fetch from "node-fetch";

const API_KEY = "b8bed9a093539a61f851a69ac53cb45e";

async function testBothModes() {
  console.log("🔍 Testing VTPass API Key in Both Modes...\n");
  
  const modes = [
    { name: "LIVE", url: "https://vtpass.com/api" },
    { name: "SANDBOX", url: "https://sandbox.vtpass.com/api" }
  ];
  
  for (const mode of modes) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Testing ${mode.name} Mode`);
    console.log(`URL: ${mode.url}/balance`);
    console.log("=".repeat(50));
    
    try {
      const response = await fetch(`${mode.url}/balance`, {
        method: "GET",
        headers: {
          "api-key": API_KEY,
          "secret-key": API_KEY
        }
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      
      if (data.code === "000") {
        console.log(`\n✅ ${mode.name} MODE WORKS!`);
        console.log(`Balance: ${data.contents?.balance || data.content?.balance}`);
        return;
      } else {
        console.log(`\n❌ ${mode.name} Failed: ${data.message || data.response_description}`);
      }
    } catch (error) {
      console.log(`\n❌ ${mode.name} Error: ${error.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("⚠️ API KEY NOT WORKING IN EITHER MODE");
  console.log("=".repeat(50));
  console.log("\nPlease verify:");
  console.log("1. The API key is correct");
  console.log("2. The API key is activated on VTPass dashboard");
  console.log("3. Your VTPass account has sufficient balance");
  console.log("4. You're using the right credentials for your account type");
}

testBothModes();
