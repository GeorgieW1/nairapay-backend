# 🚀 Next Steps After Adding VTpass Credentials

## ✅ **What You Just Did:**
1. ✅ Added VTpass credentials (API Key, Public Key, Secret Key)
2. ✅ Set up integrations for airtime, data, and electricity
3. ✅ Backend is ready to call real VTpass API

---

## 🧪 **Step 1: Test VTpass Connection**

### Test via Admin Dashboard:
1. Go to your admin dashboard
2. Make sure you're in the Integrations section
3. You should see your VTpass integrations listed

### Test via API (Optional):
```bash
# Get your admin token first by logging in
POST https://nairapay-backend-production.up.railway.app/api/auth/login
{
  "email": "your-admin@email.com",
  "password": "your-password"
}

# Then test VTpass connection
POST https://nairapay-backend-production.up.railway.app/api/vtpass/airtime/test
Headers: {
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Airtime test sent to VTpass sandbox",
  "vtpassResponse": {
    "code": "000",
    "response_description": "TRANSACTION SUCCESSFUL"
  }
}
```

---

## 💰 **Step 2: Fund a Test User Wallet**

### Option A: Via Admin Dashboard (if you have a fund wallet feature)
- Login as admin
- Find or create a test user
- Fund their wallet (e.g., ₦5,000)

### Option B: Via API:
```bash
# First, register a test user
POST https://nairapay-backend-production.up.railway.app/api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123456"
}

# Login to get token
POST https://nairapay-backend-production.up.railway.app/api/auth/login
{
  "email": "test@example.com",
  "password": "test123456"
}

# Fund wallet
POST https://nairapay-backend-production.up.railway.app/api/wallet/fund
Headers: {
  "Authorization": "Bearer USER_TOKEN"
}
{
  "amount": 5000
}
```

### Option C: Direct MongoDB Update (Quick):
1. Go to MongoDB Atlas
2. Find your test user
3. Update `walletBalance` to `5000`

---

## 📱 **Step 3: Test Real Airtime Purchase**

Now test if VTpass integration is working:

```bash
# Buy airtime
POST https://nairapay-backend-production.up.railway.app/api/services/airtime
Headers: {
  "Authorization": "Bearer USER_TOKEN"
}
{
  "phone": "08111111111",  # Use VTpass test number
  "network": "MTN",
  "amount": 100
}
```

**What Should Happen:**
1. ✅ Check wallet balance (must have ₦100+)
2. ✅ Call VTpass sandbox API
3. ✅ Process real VTpass purchase
4. ✅ Deduct from wallet
5. ✅ Create transaction record
6. ✅ Return success response

**Success Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "_id": "...",
    "type": "airtime",
    "amount": 100,
    "status": "completed",
    "phone": "08111111111",
    "network": "MTN"
  },
  "newBalance": 4900
}
```

---

## 📊 **Step 4: Monitor Everything**

### Check Railway Logs:
```
Railway → Your Project → Deployments → View Logs
```

**Look for:**
- ✅ `POST /api/services/airtime 200` (success)
- ✅ `Fetching https://sandbox.vtpass.com/api/pay`
- ✅ `VTpass response: { "code": "000", ... }`
- ✅ `Transaction completed: airtime -100`

**If you see errors:**
- ❌ `Airtime service not configured` → Check if integration exists
- ❌ `Missing VTpass credentials` → Check credentials in database
- ❌ `VTpass purchase failed` → Check VTpass response in logs

### Check MongoDB:
```
MongoDB Atlas → Browse Collections → transactions
```

**Verify:**
- ✅ Transaction created with `status: "completed"`
- ✅ `metadata.vtpassResponse` contains VTpass data
- ✅ User wallet balance deducted correctly

---

## 🎯 **Step 5: Test Data & Electricity**

### Test Data Purchase:
```bash
POST https://nairapay-backend-production.up.railway.app/api/services/data
Headers: {
  "Authorization": "Bearer USER_TOKEN"
}
{
  "phone": "08111111111",
  "network": "MTN",
  "dataPlan": "1GB",
  "amount": 500
}
```

### Test Electricity Payment:
```bash
POST https://nairapay-backend-production.up.railway.app/api/services/electricity
Headers: {
  "Authorization": "Bearer USER_TOKEN"
}
{
  "meterNumber": "12345678901",
  "meterType": "prepaid",
  "provider": "IKEDC",
  "amount": 2000
}
```

---

## 🔍 **Step 6: Check Transaction History**

```bash
GET https://nairapay-backend-production.up.railway.app/api/transactions
Headers: {
  "Authorization": "Bearer USER_TOKEN"
}
```

**Should show:**
- ✅ All your test transactions
- ✅ Status: completed/failed
- ✅ VTpass responses in metadata

---

## ✅ **Step 7: Connect Your App**

### Update Your App's API Base URL:
```javascript
const API_BASE = "https://nairapay-backend-production.up.railway.app";
```

### Test Authentication:
```javascript
// Register user
fetch(`${API_BASE}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "App User",
    email: "app@example.com",
    password: "password123"
  })
});

// Login
const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "app@example.com",
    password: "password123"
  })
});

const { token } = await loginRes.json();
localStorage.setItem("token", token);
```

### Test Wallet Balance:
```javascript
const balanceRes = await fetch(`${API_BASE}/api/wallet/balance`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

### Test Airtime Purchase:
```javascript
const airtimeRes = await fetch(`${API_BASE}/api/services/airtime`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    phone: "08111111111",
    network: "MTN",
    amount: 100
  })
});
```

---

## 🐛 **Troubleshooting**

### Issue: "Airtime service not configured"
**Fix:**
- Check if VTpass integration exists in database
- Make sure `category: "airtime"` matches
- Check provider name contains "VTpass"

### Issue: "Missing VTpass credentials"
**Fix:**
- Verify all 3 credentials are saved: API Key, Public Key, Secret Key
- Check credentials in MongoDB Atlas → integrations collection

### Issue: "VTpass purchase failed"
**Fix:**
- Check Railway logs for VTpass error message
- Verify sandbox API keys are correct
- Make sure using test phone number (08111111111)

### Issue: "Insufficient wallet balance"
**Fix:**
- Fund user wallet first
- Check balance: `GET /api/wallet/balance`

---

## 🎉 **You're Ready!**

**Once testing works:**
1. ✅ VTpass credentials added
2. ✅ Test transactions successful
3. ✅ Wallet deductions working
4. ✅ Transactions recorded
5. ✅ App can connect to backend

**Next:**
- Deploy your frontend app
- Use the Railway backend URL
- Start processing real transactions! 🚀

---

## 📝 **Quick Checklist**

- [ ] Test VTpass connection via `/api/vtpass/airtime/test`
- [ ] Create/fund a test user wallet
- [ ] Test airtime purchase
- [ ] Test data purchase
- [ ] Test electricity payment
- [ ] Check Railway logs for errors
- [ ] Check MongoDB for transactions
- [ ] Connect your app to backend
- [ ] Test full flow from app

---

## 🆘 **Need Help?**

**Check:**
- Railway logs for errors
- MongoDB for data verification
- VTpass sandbox dashboard for transaction status
- Browser console for frontend errors

**Common VTpass Test Numbers:**
- Phone: `08111111111`
- Meter: `12345678901`










