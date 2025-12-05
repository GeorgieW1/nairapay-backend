import fetch from 'node-fetch';

async function testVTPassDirect() {
  console.log('🧪 Testing VTPass credentials directly...\n');
  
  const STATIC_KEY = "b8bed9a093539a61f851a69ac53cb45e";
  const SECRET_KEY = "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221";
  
  // Test actual purchase payload (same as backend sends)
  const payload = {
    request_id: "test_12345",
    serviceID: "airtel",
    amount: "100",
    phone: "09020795235"
  };
  
  console.log('📡 Testing VTPass /pay endpoint directly:');
  console.log(`Headers: api-key + secret-key`);
  console.log(`Payload:`, JSON.stringify(payload, null, 2));
  console.log('');
  
  try {
    const response = await fetch('https://vtpass.com/api/pay', {
      method: 'POST',
      headers: {
        'api-key': STATIC_KEY,
        'secret-key': SECRET_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (data.code === "087") {
      console.log('\n❌ CREDENTIALS ARE INVALID!');
      console.log('Possible reasons:');
      console.log('1. Keys expired or deactivated');
      console.log('2. VTPass account suspended');
      console.log('3. API access not enabled');
      console.log('4. Wrong authentication type in VTPass dashboard');
    } else if (data.code === "000") {
      console.log('\n✅ CREDENTIALS WORK! Transaction successful');
    } else {
      console.log(`\n⚠️ Other response code: ${data.code}`);
      console.log(`Message: ${data.response_description || data.message}`);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testVTPassDirect();
