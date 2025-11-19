# 🚀 Testing NairaPay API with Postman

## 📋 Quick Setup Guide

### Step 1: Login to Get Token

1. **Open Postman** and create a new request
2. **Set Method:** `POST`
3. **Enter URL:** `https://nairapay-backend-production.up.railway.app/api/auth/login`
4. **Go to Headers tab:**
   - Add header: `Content-Type` = `application/json`
5. **Go to Body tab:**
   - Select `raw`
   - Select `JSON` from dropdown
   - Paste this:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
6. **Click Send**
7. **Copy the token** from the response (look for `"token": "eyJhbGci..."`)

---

### Step 2: Buy Airtime (Using Token)

1. **Create a new request** in Postman
2. **Set Method:** `POST`
3. **Enter URL:** `https://nairapay-backend-production.up.railway.app/api/services/airtime`
4. **Go to Headers tab:**
   - Add header: `Content-Type` = `application/json`
   - Add header: `Authorization` = `Bearer YOUR_TOKEN_HERE` (replace with token from Step 1)
5. **Go to Body tab:**
   - Select `raw`
   - Select `JSON` from dropdown
   - Paste this:
   ```json
   {
     "phone": "08012345678",
     "network": "MTN",
     "amount": 500
   }
   ```
6. **Click Send**

---

## 🎯 Better Way: Use Postman Environment Variables

### Setup Environment Variables (Recommended)

1. **Click the eye icon** (👁️) in top-right corner of Postman
2. **Click "Add"** to create new environment
3. **Name it:** `NairaPay Production`
4. **Add these variables:**
   - `base_url` = `https://nairapay-backend-production.up.railway.app`
   - `token` = (leave empty for now)
5. **Click "Add"** and **Select this environment** from dropdown

### Now Use Variables in Requests:

**Login Request:**
- URL: `{{base_url}}/api/auth/login`
- Body: Same as before
- After sending, **copy the token** and **update the environment variable** `token` with it

**Airtime Request:**
- URL: `{{base_url}}/api/services/airtime`
- Header: `Authorization` = `Bearer {{token}}`
- Body: Same as before

---

## 📝 Complete Postman Collection

### Request 1: Login

**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Save Token Script (Optional):**
In Postman, go to the **Tests** tab and add:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
        console.log("Token saved!");
    }
}
```

---

### Request 2: Get Wallet Balance

**Method:** `GET`  
**URL:** `{{base_url}}/api/wallet/balance`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:** None (GET request)

---

### Request 3: Buy Airtime

**Method:** `POST`  
**URL:** `{{base_url}}/api/services/airtime`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 500
}
```

**Valid Networks:**
- `MTN`
- `Airtel`
- `Glo`
- `9mobile`

---

### Request 4: Buy Data

**Method:** `POST`  
**URL:** `{{base_url}}/api/services/data`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "dataPlan": "1GB",
  "amount": 500
}
```

---

### Request 5: Pay Electricity

**Method:** `POST`  
**URL:** `{{base_url}}/api/services/electricity`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "meterNumber": "04123456789",
  "meterType": "prepaid",
  "provider": "IKEDC",
  "amount": 2000
}
```

**Valid Providers:**
- `IKEDC` (Ikeja Electric)
- `EKEDC` (Eko Electric)
- `EEDC` (Enugu Electric)
- `KEDCO` (Kano Electric)
- `AEDC` (Abuja Electric)
- `PHED` (Port Harcourt Electric)
- `IBEDC` (Ibadan Electric)

**Meter Types:**
- `prepaid`
- `postpaid`

---

### Request 6: Get Transactions

**Method:** `GET`  
**URL:** `{{base_url}}/api/transactions?page=1&limit=20`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Query Parameters (Optional):**
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optional: `credit`, `debit`, `airtime`, `data`, `electricity`)
- `status` (optional: `pending`, `completed`, `failed`)

---

### Request 7: Fund Wallet

**Method:** `POST`  
**URL:** `{{base_url}}/api/wallet/fund`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "amount": 5000,
  "paymentMethod": "bank_transfer"
}
```

---

## 🔧 Postman Tips

### 1. Auto-Save Token After Login

Add this to the **Tests** tab of your Login request:

```javascript
// Parse response
const response = pm.response.json();

// Save token if login successful
if (response.success && response.token) {
    pm.environment.set("token", response.token);
    console.log("✅ Token saved to environment!");
    console.log("Token:", response.token);
} else {
    console.log("❌ Login failed:", response.error);
}
```

### 2. Set Base URL as Environment Variable

Instead of typing the full URL each time:
- Use: `{{base_url}}/api/auth/login`
- Set `base_url` in environment: `https://nairapay-backend-production.up.railway.app`

### 3. Pre-request Script (Auto-refresh Token)

If token expires, you can add a pre-request script to check if token is valid, but for now, just login again when token expires.

---

## ✅ Testing Checklist

- [ ] Login request works and returns token
- [ ] Token is saved in environment variable
- [ ] Get wallet balance works with token
- [ ] Buy airtime works with token
- [ ] Buy data works with token
- [ ] Pay electricity works with token
- [ ] Get transactions works with token

---

## 🐛 Common Postman Errors

### Error: "No token provided"
- **Fix:** Make sure `Authorization` header is set to `Bearer {{token}}`

### Error: "Invalid or expired token"
- **Fix:** Login again to get a new token and update the `token` environment variable

### Error: "Could not get any response"
- **Fix:** Check your internet connection and verify the URL is correct

### Error: "Missing required fields"
- **Fix:** Check the Body JSON includes all required fields (phone, network, amount, etc.)

---

## 📸 Screenshot Guide

### Login Request Setup:
```
Method: POST
URL: {{base_url}}/api/auth/login
Headers: Content-Type: application/json
Body: raw JSON
{
  "email": "...",
  "password": "..."
}
```

### Protected Request Setup:
```
Method: POST
URL: {{base_url}}/api/services/airtime
Headers: 
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
Body: raw JSON
{
  "phone": "...",
  "network": "...",
  "amount": ...
}
```

---

## 🎉 You're Ready!

Now you can test all endpoints easily in Postman. Remember to:
1. **Login first** to get token
2. **Save token** in environment variable
3. **Use token** in all protected requests
