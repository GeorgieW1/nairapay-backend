# 🔐 How to Use Protected API Endpoints

## The Problem
You're getting `{"success":false,"error":"No token provided"}` because the service endpoints require authentication.

## ✅ Solution: Get a Token First

### Step 1: Login to Get a Token

**Endpoint:** `POST /api/auth/login`

**Using curl:**
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Using JavaScript/Fetch:**
```javascript
const response = await fetch('https://nairapay-backend-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});

const data = await response.json();
const token = data.token; // Save this token!
console.log('Token:', token);
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "your-email@example.com",
    "walletBalance": 53500
  }
}
```

### Step 2: Use the Token in Subsequent Requests

**Example: Buy Airtime**

**Using curl:**
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/services/airtime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "phone": "08012345678",
    "network": "MTN",
    "amount": 500
  }'
```

**Using JavaScript/Fetch:**
```javascript
const token = 'YOUR_TOKEN_HERE'; // From login response

const response = await fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ⚠️ IMPORTANT: Include this!
  },
  body: JSON.stringify({
    phone: '08012345678',
    network: 'MTN',
    amount: 500
  })
});

const data = await response.json();
console.log(data);
```

## 📋 Complete Example (Full Flow)

```javascript
// Step 1: Login
async function loginAndBuyAirtime() {
  // Login first
  const loginResponse = await fetch('https://nairapay-backend-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'your-email@example.com',
      password: 'your-password'
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    console.error('Login failed:', loginData.error);
    return;
  }
  
  const token = loginData.token;
  console.log('✅ Logged in! Token:', token);
  
  // Step 2: Use token to buy airtime
  const airtimeResponse = await fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ⚠️ Don't forget this!
    },
    body: JSON.stringify({
      phone: '08012345678',
      network: 'MTN',
      amount: 500
    })
  });
  
  const airtimeData = await airtimeResponse.json();
  console.log('Airtime purchase result:', airtimeData);
}

// Call the function
loginAndBuyAirtime();
```

## 🔑 Important Notes

1. **Token Expiration:** Tokens expire after 7 days. You'll need to login again if your token expires.

2. **Save Token Securely:** In a real app, save the token in:
   - `localStorage` (for web apps)
   - Secure storage (for mobile apps)
   - Session storage (for temporary storage)

3. **Include Token in EVERY Protected Request:**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}` // Required for all protected endpoints
   }
   ```

## 📍 Protected Endpoints (Require Token)

All these endpoints require the `Authorization: Bearer <token>` header:

- `POST /api/services/airtime` ✅
- `POST /api/services/data` ✅
- `POST /api/services/electricity` ✅
- `GET /api/wallet/balance` ✅
- `POST /api/wallet/fund` ✅
- `GET /api/transactions` ✅

## 🔓 Public Endpoints (No Token Required)

- `POST /api/auth/login` ✅
- `POST /api/auth/register` ✅
- `GET /healthz` ✅

## 🐛 Troubleshooting

### Error: "No token provided"
- **Cause:** Missing `Authorization` header
- **Fix:** Add `Authorization: Bearer <your-token>` to request headers

### Error: "Invalid or expired token"
- **Cause:** Token expired or invalid
- **Fix:** Login again to get a new token

### Error: "Access denied"
- **Cause:** Trying to access admin-only endpoint
- **Fix:** Use an admin account or different endpoint







