# 📚 NairaPay Backend API Documentation

**Base URL:** `https://nairapay-backend-production.up.railway.app`

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response (Error):**
```json
{
  "error": "User already exists"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 1000,
    "walletId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

---

### 3. Verify Token / Get Current User

**Endpoint:** `POST /api/auth/verify-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 1000,
    "walletId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 4. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset token generated",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "note": "In production, this token should be sent via email"
}
```

---

### 5. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 💰 Wallet Endpoints

### 1. Get Wallet Balance

**Endpoint:** `GET /api/wallet/balance`

**Headers:**
```
Authorization: Bearer <token>
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

### 2. Fund Wallet

**Endpoint:** `POST /api/wallet/fund`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "amount": 5000,
  "paymentMethod": "bank_transfer" // or "card", "bank_transfer", etc.
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet funded successfully",
  "newBalance": 6000,
  "transaction": {
    "_id": "...",
    "type": "credit",
    "amount": 5000,
    "status": "completed",
    "createdAt": "..."
  }
}
```

---

## 📜 Transaction Endpoints

### 1. Get Transactions

**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (`credit`, `debit`, `airtime`, `data`, `electricity`)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`)

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "airtime",
      "amount": 500,
      "status": "completed",
      "description": "Airtime purchase - MTN 08012345678",
      "createdAt": "...",
      "updatedAt": "..."
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

### 2. Get Single Transaction

**Endpoint:** `GET /api/transactions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "_id": "...",
    "type": "airtime",
    "amount": 500,
    "status": "completed",
    "description": "Airtime purchase - MTN 08012345678",
    "metadata": {
      "phone": "08012345678",
      "network": "MTN",
      "provider": "VTpass"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 📱 Service Endpoints

### 1. Buy Airtime

**Endpoint:** `POST /api/services/airtime`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "phone": "08012345678",
  "network": "MTN", // MTN, Airtel, Glo, 9mobile
  "amount": 500
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "_id": "...",
    "type": "airtime",
    "amount": 500,
    "status": "completed",
    "phone": "08012345678",
    "network": "MTN"
  },
  "newBalance": 500
}
```

**Response (Error - Insufficient Balance):**
```json
{
  "success": false,
  "error": "Insufficient wallet balance"
}
```

---

### 2. Buy Data

**Endpoint:** `POST /api/services/data`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "phone": "08012345678",
  "network": "MTN", // MTN, Airtel, Glo, 9mobile
  "dataPlan": "1GB", // or plan ID
  "amount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data purchased successfully",
  "transaction": {
    "_id": "...",
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

### 3. Pay Electricity

**Endpoint:** `POST /api/services/electricity`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "meterNumber": "04123456789",
  "meterType": "prepaid", // prepaid or postpaid
  "provider": "IKEDC", // IKEDC, EKEDC, KEDCO, etc.
  "amount": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Electricity bill paid successfully",
  "transaction": {
    "_id": "...",
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

## 🔑 Authorization

All protected endpoints require JWT authentication:

**Format:**
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
fetch('https://nairapay-backend-production.up.railway.app/api/wallet/balance', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})
```

---

## 📊 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, insufficient balance)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚨 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Or:

```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 📝 Notes

1. **Token Expiration:** JWT tokens expire after 7 days
2. **Wallet Balance:** Stored in NGN (Nigerian Naira)
3. **Transaction Status:** Can be `pending`, `completed`, or `failed`
4. **All amounts** are in NGN (Nigerian Naira)

---

## 🔄 Missing Endpoints (To Be Implemented)

The following endpoints are documented but need to be created:
- ✅ `/api/auth/verify-token` (works as `/api/auth/me`)
- ✅ `/api/wallet/balance` (to be created)
- ✅ `/api/wallet/fund` (to be created)
- ✅ `/api/transactions` (to be created)
- ✅ `/api/services/airtime` (to be created)
- ✅ `/api/services/data` (to be created)
- ✅ `/api/services/electricity` (to be created)

