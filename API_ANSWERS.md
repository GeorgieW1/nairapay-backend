# 📋 API Answers - Quick Reference

## 1. ✅ Authentication Endpoints (EXIST)

### Login
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "walletBalance": 0,
    "walletId": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Register
**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "walletBalance": 0,
    "createdAt": "..."
  }
}
```

### Get Current User
**Endpoint:** `POST /api/auth/verify-token` (works as `/api/auth/me`)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "walletBalance": 1000,
    "walletId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 2. ❌ Wallet & Transaction Endpoints (NEED TO BE CREATED)

These endpoints don't exist yet. I'll create them now:
- ✅ `/api/wallet/balance` - Will create
- ✅ `/api/wallet/fund` - Will create
- ✅ `/api/transactions` - Will create
- ✅ `/api/services/airtime` - Will create
- ✅ `/api/services/data` - Will create
- ✅ `/api/services/electricity` - Will create

---

## 3. ✅ Authorization Format

**YES - Bearer token in Authorization header:**

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

**Example:**
```javascript
fetch('https://nairapay-backend-production.up.railway.app/api/wallet/balance', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

---

## 4. ✅ User Profile Endpoint

**YES - Use:** `POST /api/auth/verify-token`

This returns the current user's profile (acts as `/api/auth/me`)

---

## 🚀 Next Step: Creating Missing Endpoints

I'll now create:
1. Wallet controller & routes
2. Transaction model, controller & routes
3. Service controller & routes (airtime, data, electricity)

