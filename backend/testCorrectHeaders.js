import fetch from "node-fetch";

const STATIC_KEY = "b8bed9a093539a61f851a69ac53cb45e";
const PUBLIC_KEY = "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548";

async function testServiceVariations() {
  console.log("🔍 Testing service-variations with correct headers...\n");
  console.log("Headers:");
  console.log(`  api-key: ${STATIC_KEY}`);
  console.log(`  public-key: ${PUBLIC_KEY}\n`);
  
  try {
    const response = await fetch('https://vtpass.com/api/service-variations?serviceID=mtn', {
      method: "GET",
      headers: {
        "api-key": STATIC_KEY,
        "public-key": PUBLIC_KEY
      }
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok && data.code !== "087") {
      console.log("\n✅ SUCCESS with correct headers!");
      return true;
    } else {
      console.log("\n❌ Failed with correct headers");
      console.log(`Code: ${data.code}`);
      return false;
    }
  } catch (error) {
    console.log("\n❌ Error:", error.message);
    return false;
  }
}

testServiceVariations();
