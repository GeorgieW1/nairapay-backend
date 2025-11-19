import fetch from "node-fetch";

const API_KEY = "b8bed9a093539a61f851a69ac53cb45e";

// Test VTPass connection
async function testVTPass() {
  console.log("🔍 Testing VTPass API connection...\n");
  
  const urls = [
    "https://vtpass.com/api/service-variations?serviceID=mtn",
    "https://api-service.vtpass.com/api/service-variations?serviceID=mtn",
    "https://sandbox.vtpass.com/api/service-variations?serviceID=mtn"
  ];
  
  for (const url of urls) {
    console.log(`\n📡 Testing: ${url}`);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "api-key": API_KEY,
          "secret-key": API_KEY
        }
      });
      
      const data = await response.json();
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response:`, JSON.stringify(data, null, 2));
      
      if (response.status === 200 || response.ok) {
        console.log(`\n🎉 SUCCESS! This URL works: ${url}`);
        return;
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n❌ None of the URLs worked. Check your API key or VTPass status.");
}

testVTPass();
