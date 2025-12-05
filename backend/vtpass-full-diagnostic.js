import fetch from 'node-fetch';
import fs from 'fs';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('vtpass_diagnostic.txt', msg + '\n');
};

const CREDENTIALS = {
    apiKey: "b8bed9a093539a61f851a69ac53cb45e",
    publicKey: "PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548",
    secretKey: "SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221"
};

async function testEndpoint(name, url, method, headers, body = null) {
    log(`\n${name}:`);
    log(`URL: ${url}`);
    log(`Headers: ${JSON.stringify(headers)}`);
    if (body) log(`Body: ${JSON.stringify(body)}`);

    try {
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        const data = await response.json();

        log(`Status: ${response.status}`);
        log(`Response: ${JSON.stringify(data, null, 2)}`);

        return { success: data.code === "000" || data.code === "014", data };
    } catch (error) {
        log(`Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    fs.writeFileSync('vtpass_diagnostic.txt', '');
    log('🔍 VTpass Diagnostics\n');
    log(`API Key: ${CREDENTIALS.apiKey}`);
    log(`Public Key: ${CREDENTIALS.publicKey}`);
    log(`Secret Key: ${CREDENTIALS.secretKey}`);
    log('=' * 60);

    // Test 1: GET /balance (LIVE)
    const test1 = await testEndpoint(
        '1️⃣ GET /balance (LIVE)',
        'https://vtpass.com/api/balance',
        'GET',
        { 'api-key': CREDENTIALS.apiKey, 'public-key': CREDENTIALS.publicKey }
    );

    // Test 2: POST /pay (LIVE)
    const test2 = await testEndpoint(
        '2️⃣ POST /pay (LIVE)',
        'https://vtpass.com/api/pay',
        'POST',
        { 'api-key': CREDENTIALS.apiKey, 'secret-key': CREDENTIALS.secretKey, 'Content-Type': 'application/json' },
        { request_id: "test_" + Date.now(), serviceID: "mtn", amount: "50", phone: "08012345678" }
    );

    // Test 3: GET /balance (SANDBOX)
    const test3 = await testEndpoint(
        '3️⃣ GET /balance (SANDBOX)',
        'https://sandbox.vtpass.com/api/balance',
        'GET',
        { 'api-key': CREDENTIALS.apiKey, 'public-key': CREDENTIALS.publicKey }
    );

    log('\n' + '=' * 60);
    log('RESULTS:');
    log(`GET /balance (LIVE):    ${test1.success ? '✅ PASS' : '❌ FAIL'}`);
    log(`POST /pay (LIVE):       ${test2.success ? '✅ PASS' : '❌ FAIL'}`);
    log(`GET /balance (SANDBOX): ${test3.success ? '✅ PASS' : '❌ FAIL'}`);
    log('=' * 60);

    if (!test1.success && !test2.success && !test3.success) {
        log('\n❌ ALL TESTS FAILED - Keys are invalid or account has issues');
    }
}

runTests();
