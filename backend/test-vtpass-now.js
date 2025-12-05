import fetch from 'node-fetch';
import fs from 'fs';

async function testVTPassDirect() {
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('vtpass_test_result.txt', msg + '\n');
    };

    fs.writeFileSync('vtpass_test_result.txt', '');

    log('🧪 Testing VTPass credentials directly...\n');

    const STATIC_KEY = "b8bed9a093539a61f851a69ac53cb45e";
    const SECRET_KEY = "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221";

    const payload = {
        request_id: "test_" + Date.now(),
        serviceID: "airtel",
        amount: "100",
        phone: "09020795235"
    };

    log('📡 Testing VTPass /pay endpoint:');
    log(`API Key: ${STATIC_KEY}`);
    log(`Secret Key: ${SECRET_KEY}`);
    log(`Payload: ${JSON.stringify(payload, null, 2)}\n`);

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

        log(`Status: ${response.status}`);
        log(`Response: ${JSON.stringify(data, null, 2)}\n`);

        if (data.code === "087") {
            log('❌ CREDENTIALS ARE INVALID!');
            log('The keys you provided are NOT valid VTpass credentials.');
            log('They appear to be Paystack keys (PK_/SK_ prefix is Paystack format).');
        } else if (data.code === "000") {
            log('✅ CREDENTIALS WORK! Transaction successful!');
        } else {
            log(`⚠️ Response code: ${data.code}`);
            log(`Message: ${data.response_description || data.message}`);
        }

    } catch (error) {
        log('❌ Request failed: ' + error.message);
    }
}

testVTPassDirect();
