# ✅ Postman Testing Guide - Sandbox Mode

## ✅ Your Setup is Correct!

Your integrations are now properly configured:
- ✅ Mode: `sandbox` (matches sandbox URL)
- ✅ Base URL: `https://sandbox.vtpass.com/api` (correct for sandbox)
- ✅ Credentials: Sandbox credentials (matches sandbox environment)

---

## 🚀 Test in Postman

### Prerequisites

**Your Login Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

**Your Wallet Balance:** ₦53,500

---

## 📱 Test 1: Buy Airtime

### Postman Setup:

1. **Create New Request**
2. **Method:** `POST`
3. **URL:** `https://nairapay-backend-production.up.railway.app/api/services/airtime`

### Headers Tab:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

### Body Tab (raw → JSON):
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 500
}
```

### Valid Networks:
- `MTN`
- `Airtel`
- `Glo`
- `9mobile`

### Expected Response (Success):
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "_id": "...",
    "type": "airtime",
    "amount": 500,
    "status": "completed",
    "phone": "08012345678",
    "network": "MTN"
  },
  "newBalance": 53000
}
```

---

## ⚡ Test 2: Pay Electricity

### Postman Setup:

1. **Create New Request**
2. **Method:** `POST`
3. **URL:** `https://nairapay-backend-production.up.railway.app/api/services/electricity`

### Headers Tab:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

### Body Tab (raw → JSON):
```json
{
  "meterNumber": "12345678901",
  "meterType": "prepaid",
  "provider": "IKEDC",
  "amount": 2000
}
```

### Valid Providers:
- `IKEDC` (Ikeja Electric)
- `EKEDC` (Eko Electric)
- `EEDC` (Enugu Electric)
- `KEDCO` (Kano Electric)
- `AEDC` (Abuja Electric)
- `PHED` (Port Harcourt Electric)
- `IBEDC` (Ibadan Electric)

### Valid Meter Types:
- `prepaid`
- `postpaid`

---

## 📶 Test 3: Buy Data

### Postman Setup:

1. **Create New Request**
2. **Method:** `POST`
3. **URL:** `https://nairapay-backend-production.up.railway.app/api/services/data`

### Headers Tab:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

### Body Tab (raw → JSON):
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "dataPlan": "500MB - 7 Days",
  "amount": 300
}
```

---

## 💰 Test 4: Check Wallet Balance

### Postman Setup:

1. **Create New Request**
2. **Method:** `GET`
3. **URL:** `https://nairapay-backend-production.up.railway.app/api/wallet/balance`

### Headers Tab:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

### Body Tab:
Leave empty (GET request)

### Expected Response:
```json
{
  "success": true,
  "balance": 53500,
  "currency": "NGN"
}
```

---

## 📜 Test 5: Get Transactions

### Postman Setup:

1. **Create New Request**
2. **Method:** `GET`
3. **URL:** `https://nairapay-backend-production.up.railway.app/api/transactions?page=1&limit=10`

### Headers Tab:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDY4ZWNmODcwOGE0ZjE3YmRjOTBkYyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzYyMjcyMzA4LCJleHAiOjE3NjI4NzcxMDh9.jyp3mXAqh6q4pXTnvK2tVPDTduWyf0lCmDdW8kNM8Sk
```

### Query Parameters (Optional):
- `page` = 1 (default)
- `limit` = 10 (default)
- `type` = airtime (optional: credit, debit, airtime, data, electricity)
- `status` = completed (optional: pending, completed, failed)

---

## 🎯 Postman Pro Tips

### 1. Save Token as Environment Variable

**Create Environment:**
1. Click 👁️ icon (top right)
2. Click "Add" → Name: `NairaPay Sandbox`
3. Add variable: `token` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Add variable: `base_url` = `https://nairapay-backend-production.up.railway.app`
5. Select environment from dropdown

**Use in Requests:**
- URL: `{{base_url}}/api/services/airtime`
- Header: `Authorization: Bearer {{token}}`

### 2. Auto-Save Token After Login

In your Login request, go to **Tests** tab and add:
```javascript
if (pm.response.json().token) {
    pm.environment.set("token", pm.response.json().token);
    console.log("✅ Token saved!");
}
```

### 3. Create a Postman Collection

Organize all requests:
- Folder: "Authentication"
  - Login
- Folder: "Services"
  - Buy Airtime
  - Buy Data
  - Pay Electricity
- Folder: "Wallet"
  - Get Balance
  - Fund Wallet
- Folder: "Transactions"
  - Get Transactions

---

## ✅ Testing Checklist

- [ ] Buy Airtime works ✅
- [ ] Pay Electricity works ✅
- [ ] Buy Data works ✅
- [ ] Get Wallet Balance works ✅
- [ ] Get Transactions works ✅

---

## 🐛 Common Issues & Solutions

### Error: "INVALID CREDENTIALS"
- ✅ **Fixed!** Your setup is now correct with sandbox mode
- If still getting error, verify sandbox credentials are correct in VTpass dashboard

### Error: "Insufficient wallet balance"
- Your wallet has ₦53,500
- Make sure amount is less than balance

### Error: "No token provided"
- Make sure `Authorization` header includes `Bearer ` prefix
- Check token hasn't expired (valid for 7 days)

### Error: "Invalid phone number"
- Phone must be 11 digits starting with 0 (e.g., `08012345678`)
- Remove any spaces or dashes

---

## 🎉 You're Ready!

Start with **Test 1: Buy Airtime** - it should work now with your sandbox setup! ✅

If you get any errors, share the response and I'll help debug! 🚀







