# ✅ Step-by-Step: Add Your VTpass Credentials

## 🎯 **Your VTpass Credentials:**

- **API Key:** `a57e85d34251fdb00ffe61f2814bd71e`
- **Public Key:** `PK_654edd62dad8a4602dd6089fbac801350966625dcba`
- **Secret Key:** `SK_377918e6e12d99a2ada4e6187b74e6875a6084e2867`

---

## 📋 **Step-by-Step Instructions:**

### **Step 1: Login to Admin Dashboard**

1. Go to: `https://nairapay-backend-production.up.railway.app/admin`
2. Login with your admin credentials

---

### **Step 2: Delete Old Integrations (If Any)**

1. Click **"🔌 Integrations"** in the sidebar
2. If you see any VTpass integrations, click **🗑️ Delete** on each one
3. Confirm deletion

---

### **Step 3: Add Airtime Integration**

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
sandbox
```
(Or `live` if you're using production keys)

**Base URL:**
```
https://sandbox.vtpass.com/api
```
(Or `https://vtpass.com/api` for production)

**Credentials:**

**Field 1:**
- **Label:** `API Key`
- **Value:** `a57e85d34251fdb00ffe61f2814bd71e`

**Field 2:**
- **Label:** `Public Key`
- **Value:** `PK_654edd62dad8a4602dd6089fbac801350966625dcba`

**Field 3:**
- **Label:** `Secret Key`
- **Value:** `SK_377918e6e12d99a2ada4e6187b74e6875a6084e2867`

2. Click **💾 Save Integration**

---

### **Step 4: Add Data Integration**

1. Fill in the form again (or the form should be reset):

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
sandbox
```

**Base URL:**
```
https://sandbox.vtpass.com/api
```

**Credentials:**

**Field 1:**
- **Label:** `API Key`
- **Value:** `a57e85d34251fdb00ffe61f2814bd71e`

**Field 2:**
- **Label:** `Public Key`
- **Value:** `PK_654edd62dad8a4602dd6089fbac801350966625dcba`

**Field 3:**
- **Label:** `Secret Key`
- **Value:** `SK_377918e6e12d99a2ada4e6187b74e6875a6084e2867`

2. Click **💾 Save Integration**

---

### **Step 5: Add Electricity Integration**

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
sandbox
```

**Base URL:**
```
https://sandbox.vtpass.com/api
```

**Credentials:**

**Field 1:**
- **Label:** `API Key`
- **Value:** `a57e85d34251fdb00ffe61f2814bd71e`

**Field 2:**
- **Label:** `Public Key`
- **Value:** `PK_654edd62dad8a4602dd6089fbac801350966625dcba`

**Field 3:**
- **Label:** `Secret Key`
- **Value:** `SK_377918e6e12d99a2ada4e6187b74e6875a6084e2867`

2. Click **💾 Save Integration**

---

## ✅ **Verify It Worked:**

After adding all three integrations, you should see:

1. **Airtime** - VTpass - sandbox
2. **Data** - VTpass - sandbox  
3. **Electricity** - VTpass - sandbox

Each should show credentials masked as `****` in the table.

---

## 🧪 **Test It:**

### **Test Airtime Purchase:**

From your app or Postman:

```bash
POST https://nairapay-backend-production.up.railway.app/api/services/airtime
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json
Body:
{
  "phone": "08111111111",
  "network": "MTN",
  "amount": 100
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "status": "completed",
    ...
  },
  "newBalance": 53400
}
```

**NOT:**
```json
{
  "success": false,
  "error": "INVALID CREDENTIALS"
}
```

---

## 📋 **Quick Checklist:**

- [ ] Login to admin dashboard
- [ ] Go to Integrations section
- [ ] Delete old VTpass integrations (if any)
- [ ] Add airtime integration with all 3 keys
- [ ] Add data integration with all 3 keys
- [ ] Add electricity integration with all 3 keys
- [ ] Verify all 3 integrations show in table
- [ ] Test airtime purchase
- [ ] Check Railway logs for success

---

## 🎯 **Important Notes:**

1. **Exact Label Names:** Use these exact labels:
   - `API Key` (not "API-Key" or "api key")
   - `Public Key` (not "Public-Key")
   - `Secret Key` (not "Secret-Key")

2. **All Three Keys:** Each integration MUST have all 3 keys

3. **Same Keys:** Use the same 3 keys for airtime, data, and electricity

4. **Sandbox vs Live:**
   - If testing → Use `sandbox` mode + `https://sandbox.vtpass.com/api`
   - If production → Use `live` mode + `https://vtpass.com/api`

---

## 🆘 **If Something Goes Wrong:**

1. **Check the form:** Make sure all fields are filled
2. **Check labels:** Must be exact: `API Key`, `Public Key`, `Secret Key`
3. **Check values:** Copy-paste the keys exactly (no extra spaces)
4. **Check Railway logs:** See what error appears

---

## ✅ **After Adding:**

Once all three integrations are added:
1. ✅ Test airtime purchase
2. ✅ Test data purchase  
3. ✅ Test electricity payment

**Everything should work now!** 🎉










