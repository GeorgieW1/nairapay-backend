# 🔧 VTpass "INVALID CREDENTIALS" Fix

## 🐛 **The Problem:**

You're getting `"INVALID CREDENTIALS"` from VTpass because:

**❌ Wrong:** The code was using `public-key` for POST requests
**✅ Correct:** VTpass POST requests require `secret-key` instead

---

## 📚 **VTpass API Authentication Rules:**

According to VTpass documentation:

- **GET Requests:** Use `api-key` + `public-key`
- **POST Requests:** Use `api-key` + `secret-key` ✅

Since all service endpoints (airtime, data, electricity) use **POST** requests, they all need `secret-key`, not `public-key`.

---

## ✅ **What I Fixed:**

I updated all three service controllers to use `secret-key` instead of `public-key`:

1. ✅ `buyAirtime` - Now uses `secret-key`
2. ✅ `buyData` - Now uses `secret-key`
3. ✅ `payElectricity` - Now uses `secret-key`

---

## 🔍 **What to Check:**

### **Step 1: Verify Your Integration Credentials**

Go to your admin dashboard → Integrations and make sure you have:

1. **API Key** (Static API Key from VTpass)
2. **Public Key** (for GET requests - not used for purchases)
3. **Secret Key** (for POST requests - REQUIRED for purchases) ✅

**All three integrations** (airtime, data, electricity) should have:
- ✅ API Key
- ✅ Public Key (kept for compatibility)
- ✅ **Secret Key** (THIS IS THE ONE THAT WAS MISSING!)

---

### **Step 2: Re-add VTpass Credentials (If Needed)**

If your integrations don't have all three keys:

1. Go to admin dashboard → Integrations
2. Delete old VTpass integrations (for airtime, data, electricity)
3. Re-add them with ALL THREE keys:
   - **API Key:** Your static API key
   - **Public Key:** Your public key (PK_...)
   - **Secret Key:** Your secret key (SK_...) ← **THIS IS CRITICAL!**

---

## 🧪 **Test After Fix:**

### **Test Airtime:**
```bash
POST /api/services/airtime
{
  "phone": "08111111111",
  "network": "MTN",
  "amount": 100
}
```

### **Test Data:**
```bash
POST /api/services/data
{
  "phone": "08111111111",
  "network": "MTN",
  "dataPlan": "1GB",
  "amount": 500
}
```

### **Test Electricity:**
```bash
POST /api/services/electricity
{
  "meterNumber": "12345678901",
  "meterType": "prepaid",
  "provider": "EEDC",
  "amount": 2000
}
```

---

## 📋 **Current Status:**

Looking at your transaction history:
- ❌ Some airtime purchases **failed** (AIRTEL network)
- ✅ One MTN airtime purchase **succeeded** (before the fix?)
- ✅ Data purchase **succeeded**
- ❌ Electricity payment **failed** with "INVALID CREDENTIALS"

**After the fix, all should work!**

---

## 🔄 **Next Steps:**

1. **Wait for Railway to redeploy** (1-2 minutes)
2. **Verify credentials** in admin dashboard
3. **Test again** with your frontend app
4. **Check Railway logs** for successful VTpass responses

---

## ⚠️ **Important Notes:**

### **Credential Labels Matter:**

The code looks for credentials by label:
- `API Key` or `api` → Finds API Key
- `Secret Key` or `secret` → Finds Secret Key
- `Public Key` or `public` → Finds Public Key

**Make sure your integration credentials use these exact labels:**
- Label: `API Key`
- Label: `Secret Key`
- Label: `Public Key`

---

## 🎯 **Expected Result:**

After the fix and with correct credentials, you should see:

**Success Response:**
```json
{
  "success": true,
  "message": "Electricity bill paid successfully",
  "transaction": {
    "_id": "...",
    "status": "completed",
    ...
  },
  "newBalance": 49500
}
```

**Instead of:**
```json
{
  "success": false,
  "error": "Failed to process electricity payment",
  "vtpassError": "INVALID CREDENTIALS"
}
```

---

## 🆘 **If Still Getting Errors:**

1. **Check Railway logs** for the exact VTpass response
2. **Verify all three credentials** are saved correctly
3. **Make sure Secret Key** starts with `SK_`
4. **Test with Postman** to isolate frontend vs backend issue

**The fix is deployed - just verify your credentials are correct!**

