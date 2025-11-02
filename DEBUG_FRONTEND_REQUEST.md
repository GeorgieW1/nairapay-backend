# 🐛 Debug Frontend Request Issue

## 🔍 **What the Logs Tell Us:**

- ✅ Request **reached the server** (not connection issue)
- ❌ Status: **400 Bad Request**
- ✅ CORS is working (`access-control-allow-origin: *`)
- ⚠️ Need to see the actual error message

---

## 🎯 **Most Likely Issues:**

### **Issue 1: Missing Authorization Token** (90% chance)

The `/api/services/airtime` endpoint requires authentication.

**Check your frontend:**
```javascript
// ❌ WRONG - Missing Authorization
fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // Missing Authorization!
  },
  body: JSON.stringify({...})
})

// ✅ CORRECT - With Authorization
fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // ← ADD THIS!
  },
  body: JSON.stringify({...})
})
```

---

### **Issue 2: Missing Request Body Fields**

Required fields: `phone`, `network`, `amount`

**Check your request body:**
```javascript
// ✅ CORRECT
body: JSON.stringify({
  phone: '08111111111',
  network: 'MTN',
  amount: 100
})

// ❌ WRONG - Missing fields
body: JSON.stringify({
  phone: '08111111111'
  // Missing network and amount!
})
```

---

### **Issue 3: Invalid Amount**

Amount must be a number greater than 0.

**Check:**
```javascript
// ✅ CORRECT
amount: 100

// ❌ WRONG
amount: 0        // Must be > 0
amount: "100"     // Should be number (though string might work)
amount: -10       // Must be positive
```

---

## 🧪 **Debug Steps:**

### **Step 1: Check Browser Console**

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try buying airtime again
4. Click on the `/api/services/airtime` request
5. Check:

**Request Headers:**
- ✅ `Content-Type: application/json`
- ✅ `Authorization: Bearer <token>`

**Request Payload:**
- ✅ `phone`: string
- ✅ `network`: string (MTN, Airtel, Glo, 9mobile)
- ✅ `amount`: number > 0

**Response:**
- Check the error message in the response body

---

### **Step 2: Test Directly in Browser Console**

Run this in your browser console to see the exact error:

```javascript
// Get token first
const token = localStorage.getItem('token');
console.log('🔑 Token:', token ? 'Found ✓' : 'NOT FOUND ✗');

if (!token) {
  console.error('❌ Please login first!');
} else {
  // Test airtime purchase
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
    console.log('✅ Response:', data);
    if (data.error) {
      console.error('❌ Error:', data.error);
    }
  })
  .catch(err => {
    console.error('❌ Fetch Error:', err);
  });
}
```

**This will show you the exact error message!**

---

### **Step 3: Check Railway Logs for Error Message**

The log you shared shows the request but not the error response body. Look for:

1. Go to Railway → Your Project → Deployments → View Logs
2. Search for lines with your request timestamp
3. Look for the error response message

**Common error messages:**
```
"Phone, network, and amount are required"
"Amount must be greater than 0"
"User not found"
"Insufficient wallet balance"
"No token provided"
```

---

## ✅ **Complete Fix Code:**

### **For Your Frontend App:**

```javascript
// 1. Make sure user is logged in
async function login(email, password) {
  const response = await fetch('https://nairapay-backend-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success && data.token) {
    localStorage.setItem('token', data.token);
    return true;
  }
  return false;
}

// 2. Buy airtime with proper headers
async function buyAirtime(phone, network, amount) {
  // Get token
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Please login first');
  }

  // Validate inputs
  if (!phone || !network || !amount) {
    throw new Error('Phone, network, and amount are required');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Make request
  const response = await fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ← CRITICAL!
    },
    body: JSON.stringify({
      phone: String(phone),
      network: String(network),
      amount: Number(amount)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    // Log the error
    console.error('❌ Airtime purchase failed:', data);
    throw new Error(data.error || data.message || 'Failed to buy airtime');
  }

  return data;
}

// 3. Usage
try {
  // First login
  const loggedIn = await login('your-email@example.com', 'your-password');
  
  if (!loggedIn) {
    alert('Login failed');
    return;
  }

  // Then buy airtime
  const result = await buyAirtime('08111111111', 'MTN', 100);
  console.log('✅ Success:', result);
  alert(`Airtime purchased! New balance: ₦${result.newBalance}`);
} catch (error) {
  console.error('Error:', error);
  alert('Error: ' + error.message);
}
```

---

## 🔍 **Check These in Your Code:**

1. **Is user logged in?**
   ```javascript
   const token = localStorage.getItem('token');
   if (!token) { /* Login first! */ }
   ```

2. **Is Authorization header included?**
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}` // Must include this!
   }
   ```

3. **Are all fields in request body?**
   ```javascript
   body: JSON.stringify({
     phone: '...',    // ✓
     network: '...',  // ✓
     amount: 100     // ✓
   })
   ```

4. **Is Content-Type set?**
   ```javascript
   headers: {
     'Content-Type': 'application/json'
   }
   ```

---

## 🆘 **Quick Test:**

Run this in your browser console right now:

```javascript
// Test if you have a token
console.log('Token:', localStorage.getItem('token'));

// Test the request
fetch('https://nairapay-backend-production.up.railway.app/api/services/airtime', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    phone: '08111111111',
    network: 'MTN',
    amount: 100
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

**Share what this outputs!** That will tell us exactly what's wrong.

