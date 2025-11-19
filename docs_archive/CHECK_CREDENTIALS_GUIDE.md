# ✅ How to Check & Fix VTpass Credentials

## 🔍 **The Issue:**

You're getting `"INVALID CREDENTIALS"` which means either:
1. Secret Key is missing from your integrations
2. Credential labels don't match what the code expects
3. The keys themselves are incorrect

---

## ✅ **Step 1: Check Your Admin Dashboard**

### **Go to Admin Dashboard:**
```
https://nairapay-backend-production.up.railway.app/admin
```

1. Login with your admin credentials
2. Click **"🔌 Integrations"** in the sidebar
3. Find your VTpass integrations (should have 3: airtime, data, electricity)

---

## ✅ **Step 2: Verify Each Integration Has These Fields**

For **each** VTpass integration (airtime, data, electricity), you must have:

### **Required Fields:**
1. **Label:** `API Key` (or contains "api")
   - **Value:** Your Static API Key from VTpass (e.g., `a57e85d34251fdb00ffe61f2814bd71e`)

2. **Label:** `Public Key` (or contains "public")
   - **Value:** Your Public Key from VTpass (e.g., `PK_486abc0d14aa367fbfb33b2f86227c781294a7f55ce`)

3. **Label:** `Secret Key` (or contains "secret") ← **THIS IS CRITICAL!**
   - **Value:** Your Secret Key from VTpass (e.g., `SK_108c32760d4d79c29152cfb83591cf76ebd9c34b05d`)

---

## 🔍 **Step 3: How the Code Finds Credentials**

The code looks for credentials by **label name** (case-insensitive):

```javascript
// Code looks for:
const apiKey = integration.credentials.find(c => 
  c.label.toLowerCase().includes("api"))?.value;

const secretKey = integration.credentials.find(c => 
  c.label.toLowerCase().includes("secret"))?.value;
```

**This means your labels can be:**
- ✅ `API Key` → Found ✓
- ✅ `api key` → Found ✓
- ✅ `Static API Key` → Found ✓
- ✅ `Secret Key` → Found ✓
- ✅ `secret key` → Found ✓
- ✅ `SK` → Found ✓ (if label contains "secret")

---

## ⚠️ **Common Problems:**

### **Problem 1: Missing Secret Key**
If you only have API Key and Public Key, purchases will fail!

**Fix:** Add Secret Key to all three integrations

---

### **Problem 2: Wrong Label Names**
If labels are wrong (e.g., "API-Key" with dash), it might not be found.

**Fix:** Use exact labels: `API Key`, `Public Key`, `Secret Key`

---

### **Problem 3: Wrong Values**
If the actual key values are wrong, VTpass will reject them.

**Fix:** Copy keys directly from VTpass dashboard

---

## ✅ **Step 4: Re-Add Credentials (If Needed)**

### **Option A: Update Existing Integration**

1. Go to Admin Dashboard → Integrations
2. See your VTpass integrations listed
3. **Check if Secret Key is there:**
   - If missing → Delete and re-add (below)
   - If present but wrong → Delete and re-add

### **Option B: Delete & Re-Add (Recommended)**

1. **Delete old integrations:**
   - Click **🗑️ Delete** on each VTpass integration (airtime, data, electricity)

2. **Re-add airtime integration:**
   - Provider Name: `VTpass`
   - Category: `airtime`
   - Base URL: `https://sandbox.vtpass.com/api` (or `https://vtpass.com/api` for live)
   - Mode: `sandbox` (or `live`)
   - Credentials:
     - Field 1: Label: `API Key`, Value: `your-static-api-key`
     - Field 2: Label: `Public Key`, Value: `PK_your-public-key`
     - Field 3: Label: `Secret Key`, Value: `SK_your-secret-key` ← **CRITICAL!**
   - Click **💾 Save Integration**

3. **Re-add data integration:**
   - Same as above, but Category: `data`

4. **Re-add electricity integration:**
   - Same as above, but Category: `electricity`

---

## 🧪 **Step 5: Test After Re-adding**

### **Test Airtime:**
```bash
POST /api/services/airtime
{
  "phone": "08111111111",  # Use valid 11-digit number
  "network": "MTN",
  "amount": 100
}
```

**Expected:**
- ✅ Success (if credentials are correct)
- ❌ Still "INVALID CREDENTIALS" (if keys are wrong)

---

## 🔍 **Step 6: Verify Keys from VTpass**

### **Get Keys from VTpass:**

1. Go to **https://www.vtpass.com** (or sandbox)
2. Login to your account
3. Go to **Profile → API Keys**
4. Copy all three keys:
   - **Static API Key** (starts with letters/numbers)
   - **Public Key** (starts with `PK_`)
   - **Secret Key** (starts with `SK_`)

**⚠️ Important:**
- Public and Secret keys are shown **only once**
- If you lost them, you need to regenerate

---

## 📋 **Quick Checklist:**

- [ ] Login to admin dashboard
- [ ] Go to Integrations section
- [ ] Check VTpass integrations exist (airtime, data, electricity)
- [ ] Verify each has 3 credentials:
  - [ ] API Key
  - [ ] Public Key
  - [ ] **Secret Key** ← Most important!
- [ ] Check labels are correct (API Key, Public Key, Secret Key)
- [ ] Check values match VTpass dashboard
- [ ] If missing/wrong → Delete and re-add
- [ ] Test airtime purchase again

---

## 🚨 **Still Not Working?**

### **Check Railway Logs:**

1. Railway → Your Project → Deployments → View Logs
2. Look for the exact VTpass error response
3. Check if it says:
   - `"INVALID CREDENTIALS"` → Keys are wrong
   - `"Missing VTpass credentials"` → Keys not found in database
   - `"Airtime service not configured"` → Integration missing

---

## 💡 **Pro Tip:**

**The Secret Key is the most important** - without it, all POST requests (purchases) will fail with "INVALID CREDENTIALS".

Make sure all three integrations have:
- ✅ API Key
- ✅ Public Key  
- ✅ **Secret Key** ← **CAN'T WORK WITHOUT THIS!**

---

## ✅ **Summary:**

**YES, you should re-add the keys** if:
- Secret Key is missing
- You're not sure if keys are correct
- Keys might be from wrong VTpass account

**Make sure:**
1. Use exact labels: `API Key`, `Public Key`, `Secret Key`
2. Copy keys directly from VTpass
3. Add to all three integrations (airtime, data, electricity)
4. Use sandbox keys if testing, live keys for production

**After re-adding, test again!**










