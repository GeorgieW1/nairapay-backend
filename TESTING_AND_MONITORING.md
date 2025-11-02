# 🧪 Testing & Monitoring Guide - Railway

## 📊 Monitoring Your Backend on Railway

### 1. View Live Logs

**Railway Dashboard:**
1. Go to your **project** → **Deployments** tab
2. Click on the latest deployment
3. Click **"View Logs"** button
4. See real-time logs from your backend!

**What you'll see:**
- ✅ Login attempts: `POST /api/auth/login`
- ✅ API requests: `GET /api/wallet/balance`, `POST /api/services/airtime`
- ✅ Errors: Database errors, validation errors, etc.
- ✅ Server messages: `✅ MongoDB Connected Successfully`, `🚀 Server running on port 5000`

**In Logs, you'll see:**
```
INFO POST /api/auth/login 200
INFO GET /api/wallet/balance 200
INFO POST /api/services/airtime 200
ERROR POST /api/services/electricity 400 - Insufficient balance
```

---

### 2. Monitor Metrics

**Railway Dashboard:**
1. Go to your **project** → **Metrics** tab
2. View:
   - **CPU Usage** - How much processing power you're using
   - **Memory Usage** - RAM consumption
   - **Network** - Data transfer in/out
   - **Response Times** - How fast your API responds

**Good to know:**
- Free tier limits: $5 credit/month
- Check if you're approaching limits

---

### 3. View MongoDB Data

**Direct Database Access:**

**Option A: MongoDB Atlas Dashboard** (Easiest)
1. Go to **https://cloud.mongodb.com**
2. Sign in
3. Click on your **cluster**
4. Click **"Browse Collections"**
5. See your data in real-time!

**What you'll see:**
- `users` collection - All registered users
- `transactions` collection - All transactions
- `apikeys` collection - Stored API keys
- `integrations` collection - Service integrations

**Option B: MongoDB Compass** (Desktop App)
1. Download **MongoDB Compass** (free)
2. Connect using your `MONGO_URI` connection string
3. Browse collections visually
4. See users, transactions, balances, etc.

---

## 🧪 Testing Your Backend

### Test 1: Health Check (No Auth Needed)

**Browser:**
```
https://nairapay-backend-production.up.railway.app/healthz
```
Should show: `{"status":"ok"}`

---

### Test 2: Register New User (App User)

**Using Postman or curl:**
```bash
POST https://nairapay-backend-production.up.railway.app/api/auth/register

Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "testpassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "walletBalance": 0
  }
}
```

**Then check MongoDB:** User should appear in `users` collection!

---

### Test 3: Login User

```bash
POST https://nairapay-backend-production.up.railway.app/api/auth/login

Body:
{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "test@example.com",
    "role": "user",
    "walletBalance": 0
  }
}
```

**Copy the token!** You'll need it for next tests.

---

### Test 4: Get Wallet Balance

```bash
GET https://nairapay-backend-production.up.railway.app/api/wallet/balance

Headers:
Authorization: Bearer <token-from-login>
```

**Expected Response:**
```json
{
  "success": true,
  "balance": 0,
  "currency": "NGN"
}
```

---

### Test 5: Fund Wallet

```bash
POST https://nairapay-backend-production.up.railway.app/api/wallet/fund

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 10000,
  "paymentMethod": "test"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "newBalance": 10000,
  "transaction": {...}
}
```

**Check MongoDB:** Balance updated in `users` collection, transaction in `transactions` collection!

---

### Test 6: Get Transactions

```bash
GET https://nairapay-backend-production.up.railway.app/api/transactions

Headers:
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "type": "credit",
      "amount": 10000,
      "status": "completed",
      "description": "Wallet funded via test"
    }
  ]
}
```

---

### Test 7: Buy Airtime

```bash
POST https://nairapay-backend-production.up.railway.app/api/services/airtime

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 500
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "newBalance": 9500,
  "transaction": {...}
}
```

**Check MongoDB:** Balance reduced, new transaction created!

---

### Test 8: Try Insufficient Balance

```bash
POST https://nairapay-backend-production.up.railway.app/api/services/airtime

Body:
{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 100000  // More than balance
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Insufficient wallet balance"
}
```

**Check Logs:** Error logged in Railway!

---

## 📱 Monitor in Real-Time

### Watch Logs While Testing:

1. Open **Railway** → Your project → Deployments → View Logs
2. In another tab, make API calls
3. Watch logs update in real-time!

**You'll see:**
```
Connecting to MongoDB...
✅ MongoDB Connected Successfully
POST /api/auth/login 200 OK
GET /api/wallet/balance 200 OK
POST /api/services/airtime 200 OK
POST /api/wallet/fund 200 OK
```

**Errors:**
```
ERROR POST /api/services/data 400 - Insufficient wallet balance
ERROR GET /api/wallet/balance 401 - Invalid token
```

---

## 🔍 What to Monitor

### 1. API Requests
- Login attempts
- Failed logins (wrong password)
- Successful transactions
- Failed transactions (insufficient balance)

### 2. Database Changes
**In MongoDB Atlas:**
- New users registered
- Wallet balance changes
- New transactions created
- Transaction status updates

### 3. Errors
- Authentication failures
- Validation errors
- Database connection issues
- Service integration failures

---

## 🧪 Complete Test Flow

### Full User Journey Test:

1. ✅ Register user → Check MongoDB: User created
2. ✅ Login → Get JWT token
3. ✅ Check balance → Should be 0
4. ✅ Fund wallet → Balance increases, transaction created
5. ✅ Check balance → Verify updated balance
6. ✅ View transactions → See funding transaction
7. ✅ Buy airtime → Balance decreases, transaction created
8. ✅ View transactions → See both transactions
9. ✅ Try insufficient balance → Should fail with error
10. ✅ View logs → Confirm all requests logged

---

## 🛠️ Useful Tools

### 1. Postman
- Download: https://www.postman.com
- Create collection for all endpoints
- Save environment with your Railway URL

### 2. curl (Command Line)
- Quick testing from terminal
- Great for automated testing

### 3. MongoDB Compass
- Download: https://www.mongodb.com/try/download/compass
- Visual database browser
- See all your data

### 4. Railway CLI
- Install: `npm i -g @railway/cli`
- Monitor from terminal
- View logs locally

---

## 📊 Monitoring Dashboard Setup

**Railway Project Overview:**
- **Deployments:** See deployment history
- **Metrics:** CPU, memory, network usage
- **Variables:** Check environment variables
- **Settings:** Configure domain, environment

**Best Practice:** Keep Railway dashboard open while testing to watch logs in real-time!

---

## ✅ Success Indicators

**In Logs, you should see:**
- ✅ `POST /api/auth/login 200` (successful logins)
- ✅ `GET /api/wallet/balance 200`
- ✅ `POST /api/wallet/fund 200`
- ✅ `POST /api/services/airtime 200`
- ✅ No error messages

**In MongoDB, you should see:**
- ✅ Users collection growing
- ✅ Wallet balances updating
- ✅ Transactions being created
- ✅ All transaction types (credit, debit, airtime, data, electricity)

---

## 🎯 Next Steps

1. Test all endpoints with Postman/curl
2. Watch Railway logs in real-time
3. Check MongoDB Atlas for data changes
4. Monitor metrics for performance
5. Test error scenarios (insufficient balance, invalid token, etc.)

**Your backend is fully functional and ready for integration!** 🎉


