import fetch from 'node-fetch';

async function testAirtimeRequest() {
  console.log('🧪 Testing airtime request to Railway...\n');
  
  const url = 'https://nairapay-backend-production.up.railway.app/api/services/airtime';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY0NjMzMzQyLCJleHAiOjE3NjUyMzgxNDJ9.r-q22yw5AIAtR-H0M3ObyJaoeotyiqF90GrwFiac1T4';
  
  const body = {
    phone: '09020795235',
    network: 'AIRTEL',
    amount: 100.0
  };
  
  console.log('📡 Request details:');
  console.log(`URL: ${url}`);
  console.log(`Body:`, JSON.stringify(body, null, 2));
  console.log(`Token: ${token.substring(0, 50)}...\n`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log('\n❌ 400 Error - Possible causes:');
      console.log('1. Insufficient wallet balance');
      console.log('2. Invalid phone number format');
      console.log('3. Invalid network name');
      console.log('4. Missing VTPass integration');
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testAirtimeRequest();
