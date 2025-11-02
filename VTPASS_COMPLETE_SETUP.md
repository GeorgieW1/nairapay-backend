# 🔌 VTpass Integration - Complete Setup

## 🎯 Current Status

**✅ Good News:** Your backend is now **ready to call real VTpass API!**

**❌ But:** You need to add VTpass credentials first via admin dashboard

---

## 📋 Step 1: Get VTpass Sandbox API Keys

### Sign Up:
1. Go to **https://www.vtpass.com**
2. Click **"Sign Up"** or **"Register"**
3. Choose **"Sandbox Account"** (free for testing)
4. Complete registration

### Get API Keys:
1. Log in to VTpass sandbox dashboard
2. Go to **Profile** → **API Keys**
3. Copy these **3 keys** (shown only once!):
   - **Static API Key** (e.g., `your-api-key`)
   - **Public Key** (e.g., `public_xxxxxxxx`)
   - **Secret Key** (e.g., `secret_xxxxxxxx`)

**⚠️ Important:** Save them immediately - you won't see them again!

---

## 🎛️ Step 2: Add VTpass Integration via Admin Dashboard

### Login to Admin:
```
https://nairapay-backend-production.up.railway.app/admin
```

Use your admin credentials:
- Email: `george@example.com`
- Password: `newPassword123`

### Add Three Integrations:

You need to add **3 separate integrations** (one for each service):

#### Integration 1: Airtime

1. In admin dashboard, click **"Integrations"**
2. Fill in:
   - **Provider Name:** `VTpass`
   - **Category:** `airtime`
   - **Base URL:** `https://sandbox.vtpass.com/api` (for sandbox)
   - **Mode:** `sandbox`
   - **Credentials:**
     - Field 1: Label: `Static API Key`, Value: `your-api-key`
     - Field 2: Label: `Public Key`, Value: `your-public-key`
     - Field 3: Label: `Secret Key`, Value: `your-secret-key`
3. Click **"Save Integration"**

#### Integration 2: Data

1. Click **"+ Add Field"** if needed
2. **Provider Name:** `VTpass`
3. **Category:** `data`
4. **Base URL:** `https://sandbox.vtpass.com/api`
5. **Mode:** `sandbox`
6. Same credentials as airtime
7. **Save**

#### Integration 3: Electricity

1. **Provider Name:** `VTpass`
2. **Category:** `electricity`
3. **Base URL:** `https://sandbox.vtpass.com/api`
4. **Mode:** `sandbox`
5. Same credentials as airtime
6. **Save**

---

## ✅ Step 3: How It Works Now

### Before (Simulation):
```javascript
// Old code - simulated VTpass response
const vtpassResponse = {
  code: "000",
  message: "Airtime purchase successful"
};
```

### Now (Real VTpass):
```javascript
// New code - calls real VTpass API
const vtpassResponse = await fetch('https://sandbox.vtpass.com/api/pay', {
  method: 'POST',
  headers: {
    'api-key': apiKey,
    'public-key': publicKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    request_id: 'unique-id',
    serviceID: 'mtn',
    amount: '500',
    phone: '08111111111'
  })
});
```

---

## 🧪 Step 4: Test It

### Test VTpass Connection (Admin Only):

**Using Admin Token:**
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/vtpass/airtime/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Should return:**
```json
{
  "success": true,
  "message": "Airtime test sent to VTpass sandbox",
  "vtpassResponse": {
    "code": "000",
    "content": {...},
    "response_description": "TRANSACTION SUCCESSFUL"
  }
}
```

### Test Real Airtime Purchase:

**Using User Token:**
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/services/airtime \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08111111111",
    "network": "MTN",
    "amount": 100
  }'
```

**This will:**
1. ✅ Check your wallet balance
2. ✅ Call VTpass sandbox API
3. ✅ Process real VTpass purchase
4. ✅ Deduct from your wallet
5. ✅ Create transaction record
6. ✅ Return success/failure

---

## 📊 Monitor in Railway Logs

**Watch Real-Time:**
1. Open Railway → Your project → View Logs
2. Make an airtime purchase
3. See logs like:

```
POST /api/services/airtime 200
Fetching https://sandbox.vtpass.com/api/pay
VTpass response: { "code": "000", "response_description": "TRANSACTION SUCCESSFUL" }
Transaction completed: airtime -100
```

---

## 🎯 What Happens When You Don't Have Credentials:

**Current Behavior:**
- Endpoints return: `"Airtime service not configured"` 
- Or: `"VTpass integration not found"`

**After Adding Credentials:**
- Endpoints call **real VTpass API**
- Real transactions processed
- Real responses from VTpass

---

## 📝 Sandbox vs Production

### Sandbox (`sandbox.vtpass.com`):
- ✅ Free to test
- ✅ No real money
- ✅ Test numbers: `08111111111`, etc.
- ✅ Use while developing

### Production (`vtpass.com`):
- ⚠️ Real money
- ⚠️ Need to contact VTpass support to enable
- ⚠️ Change `baseUrl` to `https://vtpass.com/api`
- ⚠️ Change `mode` to `live`

**Update when ready:**
1. In admin dashboard, click on integration
2. Change **Base URL** to `https://vtpass.com/api`
3. Change **Mode** to `live`
4. Save

---

## ✅ Checklist

- [ ] Sign up for VTpass sandbox account
- [ ] Get Static API Key
- [ ] Get Public Key
- [ ] Get Secret Key
- [ ] Login to admin dashboard
- [ ] Add VTpass integration for airtime
- [ ] Add VTpass integration for data
- [ ] Add VTpass integration for electricity
- [ ] Test `/api/vtpass/airtime/test` endpoint
- [ ] Test real airtime purchase via `/api/services/airtime`
- [ ] Check Railway logs for VTpass responses
- [ ] Verify transaction in MongoDB

---

## 🎉 After Setup

**Your endpoints will:**
1. ✅ Check wallet balance
2. ✅ Call **real VTpass API**
3. ✅ Process **real purchases**
4. ✅ Deduct from wallet
5. ✅ Create transaction records
6. ✅ Return VTpass response

**No more simulation - fully functional VTpass integration!**

---

## 📞 Need Help?

- VTpass Docs: https://www.vtpass.com/documentation
- VTpass Support: support@vtpass.com
- Check Railway logs for specific errors


