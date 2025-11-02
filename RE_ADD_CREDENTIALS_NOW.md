# ⚡ YES - Re-Add Your VTpass Credentials!

## 🎯 **Quick Answer:**

**YES, you should re-add the credentials** because:
1. The Secret Key might be missing
2. The code now requires `secret-key` (not `public-key`) for POST requests
3. Your old integrations might have been created before the fix

---

## 📋 **Step-by-Step: Re-Add VTpass Credentials**

### **Step 1: Get Your VTpass Keys**

1. Go to **https://www.vtpass.com** (or your sandbox)
2. Login
3. Go to **Profile → API Keys**
4. Copy all three:
   - **Static API Key** (e.g., `a57e85d34251fdb00ffe61f2814bd71e`)
   - **Public Key** (e.g., `PK_486abc0d14aa367fbfb33b2f86227c781294a7f55ce`)
   - **Secret Key** (e.g., `SK_108c32760d4d79c29152cfb83591cf76ebd9c34b05d`) ← **CRITICAL!**

---

### **Step 2: Login to Admin Dashboard**

```
https://nairapay-backend-production.up.railway.app/admin
```

Login with your admin credentials.

---

### **Step 3: Delete Old Integrations**

1. Click **"🔌 Integrations"** in sidebar
2. Find your VTpass integrations
3. Click **🗑️ Delete** on each one (airtime, data, electricity)
4. Confirm deletion

---

### **Step 4: Re-Add Airtime Integration**

1. Fill in the form:

**Provider Name:** `VTpass`

**Category:** `airtime`

**Base URL:** 
- Sandbox: `https://sandbox.vtpass.com/api`
- Live: `https://vtpass.com/api`

**Mode:** `sandbox` (or `live` for production)

**Credentials:**
- **Field 1:**
  - Label: `API Key`
  - Value: `your-static-api-key` (from VTpass)

- **Field 2:**
  - Label: `Public Key`
  - Value: `PK_your-public-key` (from VTpass)

- **Field 3:**
  - Label: `Secret Key` ← **MUST HAVE THIS!**
  - Value: `SK_your-secret-key` (from VTpass)

2. Click **💾 Save Integration**

---

### **Step 5: Re-Add Data Integration**

Same as above, but:
- **Category:** `data`
- Same credentials
- Click **💾 Save Integration**

---

### **Step 6: Re-Add Electricity Integration**

Same as above, but:
- **Category:** `electricity`
- Same credentials
- Click **💾 Save Integration**

---

## ✅ **Critical Points:**

### **1. Exact Label Names:**
Use these **exact** labels:
- `API Key`
- `Public Key`
- `Secret Key`

**Not:**
- ❌ "API-Key" (with dash)
- ❌ "Api Key" (wrong case)
- ❌ "Secret_Key" (with underscore)

### **2. All Three Keys Required:**
Each integration **MUST** have:
- ✅ API Key
- ✅ Public Key
- ✅ **Secret Key** ← Can't work without this!

### **3. Same Keys for All:**
All three integrations (airtime, data, electricity) use the **same** three keys from VTpass.

---

## 🧪 **Step 7: Test After Re-Adding**

### **Test Airtime:**
Try buying airtime with a **valid 11-digit phone number**:

```
POST /api/services/airtime
{
  "phone": "08111111111",  # 11 digits, starts with 0
  "network": "MTN",
  "amount": 500
}
```

**Note:** Your previous request had `phone: 09876543567788` which is **14 digits** - that's wrong! Use 11 digits.

---

## 🐛 **Also Fix: Phone Number Format**

I noticed in your request:
```json
{
  "phone": 09876543567788,  # ❌ WRONG - Too many digits (14 digits)
  "network": "MTN",
  "amount": 500
}
```

**Nigerian phone numbers are 11 digits:**
- ✅ `08111111111` (11 digits, starts with 0)
- ✅ `09087654321` (11 digits)
- ❌ `09876543567788` (14 digits - invalid!)

**Fix your frontend** to validate phone numbers before sending.

---

## 📋 **Quick Checklist:**

- [ ] Get VTpass keys (API Key, Public Key, Secret Key)
- [ ] Login to admin dashboard
- [ ] Delete old VTpass integrations
- [ ] Re-add airtime integration with all 3 keys
- [ ] Re-add data integration with all 3 keys
- [ ] Re-add electricity integration with all 3 keys
- [ ] Verify labels are: `API Key`, `Public Key`, `Secret Key`
- [ ] Test airtime purchase with valid 11-digit phone
- [ ] Check Railway logs for success/errors

---

## 🎯 **Expected Result:**

After re-adding credentials correctly:

**Success Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "status": "completed",
    ...
  },
  "newBalance": 53000
}
```

**Instead of:**
```json
{
  "success": false,
  "error": "Failed to process airtime purchase",
  "vtpassError": "INVALID CREDENTIALS"
}
```

---

## 🆘 **Still Getting Errors?**

### **Check Railway Logs:**

1. Railway → Your Project → Deployments → View Logs
2. Look for the exact error

**Possible issues:**
- `"Missing VTpass credentials"` → Secret Key not found in database
- `"INVALID CREDENTIALS"` → Keys are wrong or expired
- `"Airtime service not configured"` → Integration not found

---

## ✅ **Summary:**

**YES - Re-add your credentials** with:
1. ✅ Exact labels: `API Key`, `Public Key`, `Secret Key`
2. ✅ All three keys in each integration
3. ✅ Same keys for airtime, data, and electricity
4. ✅ Valid 11-digit phone numbers in requests

**After re-adding, test again!**

