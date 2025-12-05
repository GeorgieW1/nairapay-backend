import fetch from 'node-fetch';

async function checkVTPassAccount() {
    const STATIC_KEY = "b8bed9a093539a61f851a69ac53cb45e";
    const PUBLIC_KEY = "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548";

    console.log('🔍 Checking VTpass Account Status...\n');

    // Test 1: Live Balance
    console.log('1️⃣ Testing LIVE environment:');
    try {
        const response = await fetch('https://vtpass.com/api/balance', {
            method: 'GET',
            headers: {
                'api-key': STATIC_KEY,
                'public-key': PUBLIC_KEY
            }
        });
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    console.log('\n2️⃣ Testing SANDBOX environment:');
    try {
        const response = await fetch('https://sandbox.vtpass.com/api/balance', {
            method: 'GET',
            headers: {
                'api-key': STATIC_KEY,
                'public-key': PUBLIC_KEY
            }
        });
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }
}

checkVTPassAccount();
