# ✅ Test Your Real VTpass Keys - Ready to Go!

## 🎉 **Great News!**

You've added the credentials:
- ✅ **API Key:** `b8bed9a093539a61f851a69ac53cb45e`
- ✅ **Public Key:** `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548`
- ✅ **Secret Key:** `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`

**These are now LIVE on Railway!** 🚀

---

## ⚡ **Important: No Deployment Needed!**

**✅ YES - It's already working on Railway!**

The credentials are stored in your **MongoDB database**. Once you added them via the admin panel, they're immediately available to your deployed backend on Railway. **No code deployment needed!**

---

## 🧪 **Next Steps: Test It!**

### **Step 1: Verify Integration Setup**

Make sure in your admin panel you have:

**Airtime Integration:**
- Provider: `VTpass`
- Category: `airtime`
- Mode: `live` (or `sandbox` if these are sandbox keys)
- Base URL: `https://vtpass.com/api` (or `https://sandbox.vtpass.com/api` for sandbox)
- Credentials:
  - ✅ Label: `API Key` → Value: `b8bed9a093539a61f851a69ac53cb45e`
  - ✅ Label: `Secret Key` → Value: `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`
  - ✅ Label: `Public Key` → Value: `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548` (optional)

---

### **Step 2: Test via Frontend App** ✅

**YES, you can test it in your frontend app right now!**

#### **Frontend Request Example:**

```javascript
// Make sure user is logged in first
const token = localStorage.getItem('token'); // or your token storage method

if (!token) {
  alert('Please login first');
  return;
}

// Buy Airtime
async function buyAirtime(phone, network, amount) {
  try {
    const response = await fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // ⚠️ CRITICAL - Must include this!
      },
      body: JSON.stringify({
        phone: phone,      // e.g., "08111111111"
        network: network,  // e.g., "MTN", "Airtel", "Glo", "9mobile"
        amount: amount     // e.g., 100 (number, not string)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error
      console.error('❌ Error:', data);
      alert('Failed: ' + (data.error || data.message || 'Unknown error'));
      return;
    }

    // Success!
    console.log('✅ Success:', data);
    alert(`Airtime purchased successfully! New balance: ₦${data.transaction?.balanceAfter || 'N/A'}`);
    return data;
  } catch (error) {
    console.error('❌ Network error:', error);
    alert('Network error: ' + error.message);
  }
}

// Usage:
buyAirtime('08111111111', 'MTN', 100);
```

#### **Required Fields:**
- ✅ `phone` - String (e.g., "08111111111")
- ✅ `network` - String: "MTN", "Airtel", "Glo", or "9mobile"
- ✅ `amount` - Number (must be > 0)
- ✅ `Authorization` header - Bearer token (user must be logged in)

#### **User Requirements:**
- ✅ User must be logged in (have valid token)
- ✅ User must have sufficient wallet balance (amount will be deducted)

---

### **Step 3: Test via Postman/API Tool** (Alternative)

If you want to test directly without frontend:

```bash
POST https://nairapay-backend-production.up.railway.app/api/services/airtime
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_USER_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "phone": "08111111111",
  "network": "MTN",
  "amount": 100
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "status": "completed",
    "amount": 100,
    "balanceAfter": 900,
    ...
  }
}
```

---

## 🔍 **What to Check if It Doesn't Work**

### **1. Check Integration Mode vs Base URL**

**If keys are LIVE/PRODUCTION:**
- Mode: `live`
- Base URL: `https://vtpass.com/api`

**If keys are SANDBOX:**
- Mode: `sandbox`
- Base URL: `https://sandbox.vtpass.com/api`

**⚠️ Mismatch = "INVALID CREDENTIALS" error!**

---

### **2. Check Credential Labels**

In admin panel, verify labels are:
- ✅ `API Key` (or contains "api")
- ✅ `Secret Key` (or contains "secret")

The code looks for labels containing these words (case-insensitive).

---

### **3. Check User Token**

Make sure:
- ✅ User is logged in
- ✅ Token is valid (not expired)
- ✅ Authorization header format: `Bearer <token>` (with space!)

---

### **4. Check Wallet Balance**

- ✅ User must have sufficient balance
- ✅ Amount must be > 0

---

### **5. Check Network Value**

Valid networks:
- ✅ `MTN`
- ✅ `Airtel`
- ✅ `Glo`
- ✅ `9mobile`

Case-sensitive! Must match exactly.

---

## 🐛 **Common Errors & Solutions**

### **Error: "INVALID CREDENTIALS"**

**Possible causes:**
1. Mode doesn't match credentials (live vs sandbox)
2. Base URL doesn't match mode
3. Credentials are wrong or have extra spaces
4. VTpass account is locked or API disabled

**Fix:**
- Verify mode and base URL match
- Re-check credentials in admin panel
- Check VTpass dashboard to ensure API is enabled

---

### **Error: "Airtime service not configured"**

**Cause:** Integration not found in database

**Fix:**
- Check admin panel - integration exists?
- Verify provider name is exactly `VTpass` (case-insensitive)
- Verify category is `airtime`

---

### **Error: "Insufficient balance"**

**Cause:** User wallet balance < amount

**Fix:**
- Add funds to user wallet first
- Check user balance in admin panel

---

### **Error: 401 Unauthorized**

**Cause:** Missing or invalid token

**Fix:**
- Make sure user is logged in
- Check Authorization header is included
- Verify token format: `Bearer <token>`

---

## ✅ **Success Indicators**

When it works, you'll see:

1. **Response Status:** `200 OK`
2. **Response Body:**
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
3. **User wallet balance:** Deducted by purchase amount
4. **Transaction created:** In database with status "completed"

---

## 🎯 **Quick Test Checklist**

- [ ] Integration added in admin panel with correct credentials
- [ ] Mode matches credentials type (live/sandbox)
- [ ] Base URL matches mode
- [ ] User is logged in (has token)
- [ ] User has sufficient wallet balance
- [ ] Frontend includes Authorization header
- [ ] Request body has: phone, network, amount
- [ ] Network value is valid (MTN, Airtel, Glo, 9mobile)

---

## 🚀 **Ready to Test!**

**Your setup is complete!** The credentials are live on Railway and ready to use.

**Try it now:**
1. Open your frontend app
2. Make sure you're logged in
3. Try buying airtime (e.g., ₦100 MTN)
4. Check the response

**If you get any errors, check the troubleshooting section above or share the error message!**

---

## 📞 **Need Help?**

If you encounter issues:
1. Check Railway logs for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify all checklist items above
4. Share the exact error message you see

**Good luck! 🎉**

