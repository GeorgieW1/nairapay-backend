# 🔧 Fix Frontend Connection Issue

## 🔍 **Problem Analysis:**

From your Railway logs, I can see:
- ✅ Request **IS reaching the server** (not a connection issue)
- ❌ Status code: **400 Bad Request**
- ✅ CORS headers present (`access-control-allow-origin: *`)
- ✅ Origin: `https://i0gohme2hnolxh8ittcp.preview.dreamflow.cloud`

**The 400 error means:**
- Request format is wrong, OR
- Missing required fields, OR  
- Missing Authorization token, OR
- Invalid data

---

## 🐛 **Common Causes:**

### 1. **Missing Authorization Token**
Most likely cause! The endpoint requires authentication.

### 2. **Missing Request Body Fields**
Required: `phone`, `network`, `amount`

### 3. **Wrong Content-Type Header**
Must be: `application/json`

---

## ✅ **Solutions:**

### **Fix 1: Check Your Frontend Request**

Your frontend request should look like this:

```javascript
// 1. First, make sure user is logged in and has a token
const token = localStorage.getItem('token'); // or however you store it

if (!token) {
  alert('Please login first');
  return;
}

// 2. Make the airtime purchase request
const response = await fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // ⚠️ THIS IS CRITICAL!
  },
  body: JSON.stringify({
    phone: '08111111111',  // Required
    network: 'MTN',        // Required
    amount: 100            // Required, must be > 0
  })
});

const data = await response.json();

if (!response.ok) {
  console.error('Error:', data.error || data.message);
  alert('Failed: ' + (data.error || data.message));
  return;
}

console.log('Success:', data);
```

---

### **Fix 2: Check Token Format**

Make sure your token is:
- ✅ Stored correctly after login
- ✅ Included in Authorization header
- ✅ Format: `Bearer <token>` (with space!)

**Example:**
```javascript
// Wrong:
headers: { 'Authorization': token }

// Correct:
headers: { 'Authorization': `Bearer ${token}` }
```

---

### **Fix 3: Verify Login Works**

Before buying airtime, test login:

```javascript
// Test login first
const loginResponse = await fetch('https://nairapay-backend-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});

const loginData = await loginResponse.json();

if (loginData.success && loginData.token) {
  // Save token
  localStorage.setItem('token', loginData.token);
  console.log('✅ Login successful, token saved');
} else {
  console.error('Login failed:', loginData);
}
```

---

### **Fix 4: Check Request Body**

Make sure all required fields are present:

```javascript
// ✅ Correct format:
{
  "phone": "08111111111",
  "network": "MTN",  // Must be: MTN, Airtel, Glo, or 9mobile
  "amount": 100      // Must be a number > 0
}

// ❌ Wrong formats:
{
  "phone": "",      // Empty phone
  "network": "",    // Empty network
  "amount": 0       // Amount must be > 0
}
```

---

## 🔍 **Debug Steps:**

### **Step 1: Check Browser Console**

Open your browser's Developer Tools (F12) and check:
1. **Network tab** → Find the airtime request
2. **Headers tab** → Check if `Authorization` header is sent
3. **Payload tab** → Check request body
4. **Response tab** → See the actual error message

**Look for:**
- ❌ Missing `Authorization` header → User not logged in
- ❌ Missing `phone`, `network`, or `amount` → Invalid request body
- ❌ `401 Unauthorized` → Invalid or expired token
- ❌ `400 Bad Request` → Missing fields or invalid data

---

### **Step 2: Test in Browser Console**

Run this directly in your browser console:

```javascript
// Get token from localStorage
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found' : 'NOT FOUND');

// Test request
fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    phone: '08111111111',
    network: 'MTN',
    amount: 100
  })
})
.then(res => res.json())
.then(data => {
  console.log('Response:', data);
  if (data.error) {
    console.error('Error:', data.error);
  }
})
.catch(err => console.error('Fetch error:', err));
```

**This will show you the exact error!**

---

### **Step 3: Check Railway Logs**

In Railway, look for the actual error message:

1. Go to Railway → Your Project → Deployments → View Logs
2. Look for lines with your request
3. Find the error response message

**Common error messages:**
- `"Phone, network, and amount are required"` → Missing fields
- `"User not found"` → Token invalid or user deleted
- `"Insufficient wallet balance"` → Need to fund wallet first
- `"Airtime service not configured"` → VTpass integration missing

---

## 📝 **Complete Frontend Example:**

```javascript
// airtimeService.js

const API_BASE = 'https://nairapay-backend-production.up.railway.app';

async function buyAirtime(phone, network, amount) {
  // 1. Get token
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please login first');
  }

  // 2. Validate inputs
  if (!phone || !network || !amount) {
    throw new Error('Phone, network, and amount are required');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // 3. Make request
  try {
    const response = await fetch(`${API_BASE}/api/services/airtime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phone,
        network,
        amount: Number(amount) // Ensure it's a number
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error
      const errorMessage = data.error || data.message || 'Failed to buy airtime';
      throw new Error(errorMessage);
    }

    // Success
    return data;
  } catch (error) {
    console.error('Airtime purchase error:', error);
    throw error;
  }
}

// Usage:
try {
  const result = await buyAirtime('08111111111', 'MTN', 100);
  console.log('Success:', result);
  alert(`Airtime purchased! New balance: ₦${result.newBalance}`);
} catch (error) {
  alert('Error: ' + error.message);
}
```

---

## ✅ **Quick Checklist:**

- [ ] User is logged in
- [ ] Token is stored (check `localStorage.getItem('token')`)
- [ ] Authorization header included: `Bearer ${token}`
- [ ] Request body has: `phone`, `network`, `amount`
- [ ] Amount is a number > 0
- [ ] Network is one of: MTN, Airtel, Glo, 9mobile
- [ ] Content-Type header: `application/json`
- [ ] User has wallet balance
- [ ] VTpass integration is configured

---

## 🆘 **If Still Not Working:**

1. **Check browser console** for exact error
2. **Check Railway logs** for server-side error
3. **Test with Postman/curl** to verify backend works
4. **Share the exact error message** you see in console

**To test with curl:**
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/services/airtime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "phone": "08111111111",
    "network": "MTN",
    "amount": 100
  }'
```

---

## 🎯 **Most Likely Fix:**

**90% chance it's this:**

Your frontend is probably missing the `Authorization` header. Make sure you:

1. ✅ Login first and get token
2. ✅ Store token: `localStorage.setItem('token', token)`
3. ✅ Include in every request: `Authorization: Bearer ${token}`

**Check this first!**










