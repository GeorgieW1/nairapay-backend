# 🔑 Add Real VTpass API Keys - Step by Step Guide

## ✅ What You Need

Based on the [VTpass API documentation](https://www.vtpass.com/documentation/introduction/), you need these credentials:

1. **API Key** (Static API Key) - Required for all requests
2. **Secret Key** - Required for POST requests (purchases: airtime, data, electricity)
3. **Public Key** - Optional (only needed for GET requests, which we don't use for purchases)

**For purchases, you MUST have:**
- ✅ **API Key**
- ✅ **Secret Key**

---

## 📋 Step-by-Step Instructions

### **Step 1: Get Your Real VTpass Keys**

The developer has given you the real keys. You should have:
- **API Key** (e.g., `a57e85d34251fdb00ffe61f2814bd71e`)
- **Secret Key** (e.g., `SK_108c32760d4d79c29152cfb83591cf76ebd9c34b05d`)
- **Public Key** (optional, e.g., `PK_486abc0d14aa367fbfb33b2f86227c781294a7f55ce`)

**Important:** 
- If these are **LIVE/PRODUCTION** keys → Use `mode: live` and `https://vtpass.com/api`
- If these are **SANDBOX** keys → Use `mode: sandbox` and `https://sandbox.vtpass.com/api`

---

### **Step 2: Login to Admin Dashboard**

1. Go to: `https://nairapay-backend-production.up.railway.app/admin`
2. Login with your admin credentials

---

### **Step 3: Delete Old Integrations (If Any)**

1. Click **"🔌 Integrations"** in the sidebar
2. Find any existing VTpass integrations
3. Click **🗑️ Delete** on each one
4. Confirm deletion

**Why?** To ensure clean setup with correct credentials.

---

### **Step 4: Add Airtime Integration**

1. In the Integrations section, fill in the form:

**Provider Name:**
```
VTpass
```

**Category:**
```
airtime
```

**Mode:**
```
live
```
(Use `live` if you have production keys, or `sandbox` if you have sandbox keys)

**Base URL:**
```
https://vtpass.com/api
```
(Use `https://vtpass.com/api` for live, or `https://sandbox.vtpass.com/api` for sandbox)

**Credentials:**

Click **"+ Add Field"** and add:

**Field 1:**
- **Label:** `API Key`
- **Value:** `[Your API Key from developer]`

**Field 2:**
- **Label:** `Secret Key` ← **CRITICAL - Must have this!**
- **Value:** `[Your Secret Key from developer]`

**Field 3 (Optional):**
- **Label:** `Public Key` (optional, for GET requests)
- **Value:** `[Your Public Key from developer]`

2. Click **💾 Save Integration**

---

### **Step 5: Add Data Integration**

1. Fill in the form again:

**Provider Name:**
```
VTpass
```

**Category:**
```
data
```

**Mode:**
```
live
```
(Same as airtime - `live` or `sandbox`)

**Base URL:**
```
https://vtpass.com/api
```
(Same as airtime)

**Credentials:**
- Same credentials as airtime (API Key, Secret Key, Public Key)

2. Click **💾 Save Integration**

---

### **Step 6: Add Electricity Integration**

1. Fill in the form:

**Provider Name:**
```
VTpass
```

**Category:**
```
electricity
```

**Mode:**
```
live
```
(Same as above)

**Base URL:**
```
https://vtpass.com/api
```
(Same as above)

**Credentials:**
- Same credentials as airtime and data

2. Click **💾 Save Integration**

---

## ✅ Verification Checklist

After adding all three integrations, verify:

- [ ] **Airtime Integration:**
  - Provider: `VTpass`
  - Category: `airtime`
  - Mode: `live` (or `sandbox`)
  - Base URL: `https://vtpass.com/api` (or sandbox URL)
  - Has `API Key` credential
  - Has `Secret Key` credential ✅

- [ ] **Data Integration:**
  - Provider: `VTpass`
  - Category: `data`
  - Mode: `live` (or `sandbox`)
  - Base URL: `https://vtpass.com/api` (or sandbox URL)
  - Has `API Key` credential
  - Has `Secret Key` credential ✅

- [ ] **Electricity Integration:**
  - Provider: `VTpass`
  - Category: `electricity`
  - Mode: `live` (or `sandbox`)
  - Base URL: `https://vtpass.com/api` (or sandbox URL)
  - Has `API Key` credential
  - Has `Secret Key` credential ✅

---

## 🧪 Test After Setup

### Test Airtime Purchase:

```bash
POST https://nairapay-backend-production.up.railway.app/api/services/airtime
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 100
}
```

### Expected Response (Success):
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "status": "completed",
    ...
  }
}
```

---

## ⚠️ Important Notes

### 1. **Mode and Base URL Must Match:**
- **Live Mode** → `https://vtpass.com/api` + Live credentials
- **Sandbox Mode** → `https://sandbox.vtpass.com/api` + Sandbox credentials

### 2. **Credential Labels Matter:**
The code looks for credentials by label (case-insensitive):
- ✅ `API Key` → Found
- ✅ `api key` → Found
- ✅ `Secret Key` → Found
- ✅ `secret key` → Found
- ❌ `Public Key` → Won't work for purchases (only for GET requests)

### 3. **For POST Requests (Purchases):**
According to [VTpass documentation](https://www.vtpass.com/documentation/authentication/):
- ✅ **Required:** `api-key` header
- ✅ **Required:** `secret-key` header
- ❌ **NOT needed:** `public-key` (only for GET requests)

Your code already handles this correctly! ✅

---

## 🆘 Troubleshooting

### Still Getting "INVALID CREDENTIALS"?

1. **Verify credentials are correct:**
   - Copy-paste from developer (no extra spaces)
   - Check if they're live or sandbox credentials
   - Ensure mode matches credentials type

2. **Check Base URL:**
   - Live: `https://vtpass.com/api`
   - Sandbox: `https://sandbox.vtpass.com/api`
   - No trailing slash!

3. **Verify credential labels:**
   - Must have label containing "api" (for API Key)
   - Must have label containing "secret" (for Secret Key)

4. **Check VTpass account:**
   - Ensure account is active
   - API access is enabled
   - Credentials haven't been regenerated

---

## 📞 Need Help?

If you're still having issues:
1. Check server logs in Railway dashboard
2. Verify credentials directly with VTpass API
3. Contact VTpass support: support@vtpass.com

---

## 🎯 Summary

**What to do:**
1. ✅ Get real keys from developer
2. ✅ Login to admin dashboard
3. ✅ Delete old integrations
4. ✅ Add 3 new integrations (airtime, data, electricity)
5. ✅ Use correct mode and base URL
6. ✅ Add API Key and Secret Key credentials
7. ✅ Test with a purchase

**Your code is ready!** Just need to add the credentials via admin dashboard. 🚀

