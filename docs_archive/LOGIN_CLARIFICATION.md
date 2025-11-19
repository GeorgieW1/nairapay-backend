# 🔐 Login Endpoint - Admin vs App Users

## ✅ **YES - The Same Login Endpoint Works for BOTH!**

The endpoint `POST /api/auth/login` is used by:
- ✅ **Admin users** (accessing `/admin` dashboard)
- ✅ **App users** (using your mobile/web app)

---

## 🔑 How It Works:

### Same Endpoint, Different Roles:

**Login:** `POST /api/auth/login`
```json
Request: {
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Same for Admin & App Users):**
```json
{
  "success": true,
  "token": "jwt-token...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",  // ← This is the key difference!
    "walletBalance": 1000
  }
}
```

---

## 🎯 The Difference:

### User Roles:
- **Admin users:** `role: "admin"` - Can access `/api/admin/*` routes
- **App users:** `role: "user"` (default) - Can access `/api/wallet/*`, `/api/transactions`, `/api/services/*`

### Access Control:
- **Admin routes** (`/api/admin/*`): Only users with `role: "admin"` can access
- **Regular routes** (`/api/wallet/*`, `/api/transactions`, `/api/services/*`): Any authenticated user (admin OR regular) can access

---

## 📱 For Your App Users:

### Registration (App Users):
```javascript
// User registers in your app
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
// Creates user with role: "user" (default)
```

### Login (App Users):
```javascript
// User logs in through your app
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
// Returns JWT token - same endpoint as admin!
```

### Using the Token:
```javascript
// App user uses token for wallet/transactions/services
GET /api/wallet/balance
Headers: { "Authorization": "Bearer <token>" }

POST /api/services/airtime
Headers: { "Authorization": "Bearer <token>" }
```

---

## 🎭 Admin vs App User Flow:

### Admin User:
1. Login: `POST /api/auth/login` → Gets token with `role: "admin"`
2. Can access: `/api/admin/*` routes ✅
3. Can access: `/api/wallet/*`, `/api/services/*` ✅ (all routes)

### App User:
1. Register: `POST /api/auth/register` → Creates user with `role: "user"`
2. Login: `POST /api/auth/login` → Gets token with `role: "user"`
3. Can access: `/api/wallet/*`, `/api/transactions`, `/api/services/*` ✅
4. Cannot access: `/api/admin/*` ❌ (403 Forbidden)

---

## ✅ Summary:

**Question:** Is login for admin or app users?

**Answer:** **BOTH!** Same endpoint, same request format:
- Admin login → `role: "admin"` → Can access admin dashboard + all app features
- App user login → `role: "user"` → Can access app features (wallet, transactions, services)

**Your app users use the EXACT same login endpoint!**

---

## 🚀 Example for Your App:

```javascript
// In your mobile/web app:
const loginUser = async (email, password) => {
  const response = await fetch('https://nairapay-backend-production.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token for future requests
    localStorage.setItem('token', data.token);
    // Use token for wallet/transactions/services
    return data.user;
  }
};
```

**This is the same endpoint admin uses!** The backend automatically handles role-based access control.











