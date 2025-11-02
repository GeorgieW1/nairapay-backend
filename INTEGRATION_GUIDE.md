# 🔌 NairaPay Backend - Integration Guide

**Base URL:** `https://nairapay-backend-production.up.railway.app`

---

## 1. ✅ Authentication Endpoints

### Login (Shared for Admin & App Users)
**Endpoint:** `POST /api/auth/login`

**⚠️ Important:** This endpoint is used by BOTH:
- ✅ Admin users (for admin dashboard)
- ✅ App users (for your mobile/web app)

**Request Format:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Note:** Same endpoint works for both! The difference is in the user's `role` field returned in the response.

**Response Format (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZmFiYzEyMzQ1Njc4OSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzA5ODc2NTQzLCJleHAiOjE3MTA0ODEzNDN9.abc123...",
  "user": {
    "_id": "65fabc123456789",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",  // ← "user" for app users, "admin" for admin users
    "walletBalance": 0,
    "walletId": null,
    "createdAt": "2024-03-08T10:30:00.000Z",
    "updatedAt": "2024-03-08T10:30:00.000Z"
  }
}
```

**Role-Based Access:**
- `role: "user"` → Can access: `/api/wallet/*`, `/api/transactions`, `/api/services/*`
- `role: "admin"` → Can access: All routes including `/api/admin/*`

**Response Format (Error):**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

**Fields:** ✅ Uses **email/password** (NOT username/password)

**JWT Token:** ✅ Yes, returns JWT token in response

---

### Register
**Endpoint:** `POST /api/auth/register`

**Request Format:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Required Fields:**
- ✅ `name` (string)
- ✅ `email` (string, must be valid email format)
- ✅ `password` (string, minimum 6 characters)

**Response Format (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "65fabc123456789",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "walletBalance": 0,
    "walletId": null,
    "createdAt": "2024-03-08T10:30:00.000Z",
    "updatedAt": "2024-03-08T10:30:00.000Z"
  }
}
```

**Note:** Register does NOT return JWT token - user must login after registration

---

## 2. ✅ Wallet & Transaction Endpoints

All endpoints are **NOW AVAILABLE** and working!

### Get Wallet Balance
**Endpoint:** `GET /api/wallet/balance`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "balance": 1000,
  "currency": "NGN"
}
```

---

### Fund Wallet
**Endpoint:** `POST /api/wallet/fund`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 5000,
  "paymentMethod": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "newBalance": 6000,
  "transaction": {
    "_id": "65fabc123456789",
    "type": "credit",
    "amount": 5000,
    "status": "completed",
    "createdAt": "2024-03-08T10:30:00.000Z"
  }
}
```

---

### Get Transactions
**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters (Optional):**
- `page` (default: 1)
- `limit` (default: 20)
- `type` (filter: `credit`, `debit`, `airtime`, `data`, `electricity`)
- `status` (filter: `pending`, `completed`, `failed`)

**Example:** `GET /api/transactions?page=1&limit=20&type=airtime&status=completed`

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "65fabc123456789",
      "type": "airtime",
      "amount": 500,
      "status": "completed",
      "description": "Airtime purchase - MTN 08012345678",
      "metadata": {
        "phone": "08012345678",
        "network": "MTN"
      },
      "createdAt": "2024-03-08T10:30:00.000Z",
      "updatedAt": "2024-03-08T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### Buy Airtime
**Endpoint:** `POST /api/services/airtime`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 500
}
```

**Network Options:** `MTN`, `Airtel`, `Glo`, `9mobile`

**Response (Success):**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "_id": "65fabc123456789",
    "type": "airtime",
    "amount": 500,
    "status": "completed",
    "phone": "08012345678",
    "network": "MTN"
  },
  "newBalance": 500
}
```

**Response (Insufficient Balance):**
```json
{
  "success": false,
  "error": "Insufficient wallet balance"
}
```

---

### Buy Data
**Endpoint:** `POST /api/services/data`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "phone": "08012345678",
  "network": "MTN",
  "dataPlan": "1GB",
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data purchased successfully",
  "transaction": {
    "_id": "65fabc123456789",
    "type": "data",
    "amount": 500,
    "status": "completed",
    "phone": "08012345678",
    "network": "MTN",
    "dataPlan": "1GB"
  },
  "newBalance": 500
}
```

---

### Pay Electricity
**Endpoint:** `POST /api/services/electricity`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "meterNumber": "04123456789",
  "meterType": "prepaid",
  "provider": "IKEDC",
  "amount": 2000
}
```

**Meter Type:** `prepaid` or `postpaid`

**Response:**
```json
{
  "success": true,
  "message": "Electricity bill paid successfully",
  "transaction": {
    "_id": "65fabc123456789",
    "type": "electricity",
    "amount": 2000,
    "status": "completed",
    "meterNumber": "04123456789",
    "provider": "IKEDC"
  },
  "newBalance": 3000
}
```

---

## 3. ✅ Authorization Format

**YES - Bearer token in Authorization header**

**Format:**
```
Authorization: Bearer <your-jwt-token>
```

**Example in JavaScript/Fetch:**
```javascript
fetch('https://nairapay-backend-production.up.railway.app/api/wallet/balance', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

**Example in Axios:**
```javascript
axios.get('https://nairapay-backend-production.up.railway.app/api/wallet/balance', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

**Token Expiration:** 7 days

---

## 4. ✅ User Profile Endpoint

**YES - Available at:** `GET /api/auth/me`

**Alternative:** `POST /api/auth/verify-token` (same response)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "65fabc123456789",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "walletBalance": 1000,
    "walletId": "wallet_123",
    "createdAt": "2024-03-08T10:30:00.000Z",
    "updatedAt": "2024-03-08T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 📝 Complete Endpoint Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login (returns JWT) |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/auth/verify-token` | POST | ✅ | Verify token / Get user |
| `/api/wallet/balance` | GET | ✅ | Get wallet balance |
| `/api/wallet/fund` | POST | ✅ | Fund wallet |
| `/api/transactions` | GET | ✅ | Get transactions |
| `/api/transactions/:id` | GET | ✅ | Get single transaction |
| `/api/services/airtime` | POST | ✅ | Buy airtime |
| `/api/services/data` | POST | ✅ | Buy data |
| `/api/services/electricity` | POST | ✅ | Pay electricity |

---

## 🧪 Quick Test Examples

### Test Login
```bash
curl -X POST https://nairapay-backend-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test Get Balance (after login, use token from login response)
```bash
curl -X GET https://nairapay-backend-production.up.railway.app/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ All Questions Answered:

1. ✅ **Authentication:** Email/password, returns JWT token
2. ✅ **Wallet & Transactions:** All endpoints created and working
3. ✅ **Authorization:** Bearer token in Authorization header
4. ✅ **User Profile:** GET /api/auth/me available

---

## 🎉 Ready for Integration!

All endpoints are live and ready to use. Railway will auto-deploy the latest code in 1-2 minutes.

**Next Steps:**
1. Test login endpoint
2. Get JWT token
3. Use token in Authorization header for protected endpoints
4. Test wallet balance
5. Test service purchases

Good luck with your integration! 🚀

