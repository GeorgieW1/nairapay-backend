# 🚀 API Quick Reference - All Answers

## ✅ 1. Authentication Endpoints

### Login
**POST** `/api/auth/login`
```json
Request: { "email": "user@example.com", "password": "password123" }
Response: { "success": true, "token": "jwt-token...", "user": {...} }
```

### Register
**POST** `/api/auth/register`
```json
Request: { "name": "John Doe", "email": "user@example.com", "password": "password123" }
Response: { "success": true, "user": {...} }
```

### Get Current User
**GET** `/api/auth/me` OR **POST** `/api/auth/verify-token`
```json
Headers: { "Authorization": "Bearer <token>" }
Response: { "success": true, "user": {...} }
```

---

## ✅ 2. Wallet & Transaction Endpoints (NOW CREATED!)

### Get Wallet Balance
**GET** `/api/wallet/balance`
```json
Headers: { "Authorization": "Bearer <token>" }
Response: { "success": true, "balance": 1000, "currency": "NGN" }
```

### Fund Wallet
**POST** `/api/wallet/fund`
```json
Headers: { "Authorization": "Bearer <token>" }
Request: { "amount": 5000, "paymentMethod": "bank_transfer" }
Response: { "success": true, "newBalance": 6000, "transaction": {...} }
```

### Get Transactions
**GET** `/api/transactions?page=1&limit=20&type=airtime&status=completed`
```json
Headers: { "Authorization": "Bearer <token>" }
Response: { "success": true, "transactions": [...], "pagination": {...} }
```

### Get Single Transaction
**GET** `/api/transactions/:id`
```json
Headers: { "Authorization": "Bearer <token>" }
Response: { "success": true, "transaction": {...} }
```

### Buy Airtime
**POST** `/api/services/airtime`
```json
Headers: { "Authorization": "Bearer <token>" }
Request: { "phone": "08012345678", "network": "MTN", "amount": 500 }
Response: { "success": true, "message": "Airtime purchased successfully", "newBalance": 500 }
```

### Buy Data
**POST** `/api/services/data`
```json
Headers: { "Authorization": "Bearer <token>" }
Request: { "phone": "08012345678", "network": "MTN", "dataPlan": "1GB", "amount": 500 }
Response: { "success": true, "message": "Data purchased successfully", "newBalance": 500 }
```

### Pay Electricity
**POST** `/api/services/electricity`
```json
Headers: { "Authorization": "Bearer <token>" }
Request: { "meterNumber": "04123456789", "meterType": "prepaid", "provider": "IKEDC", "amount": 2000 }
Response: { "success": true, "message": "Electricity bill paid successfully", "newBalance": 3000 }
```

---

## ✅ 3. Authorization

**Format:** Bearer token in Authorization header
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  'Content-Type': 'application/json'
}
```

---

## ✅ 4. User Profile

**Endpoint:** `GET /api/auth/me` OR `POST /api/auth/verify-token`
Both return the same response - current user profile

---

## 📝 Complete Endpoint List

**Base URL:** `https://nairapay-backend-production.up.railway.app`

### Authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` ✅
- `POST /api/auth/verify-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Wallet:
- `GET /api/wallet/balance` ✅
- `POST /api/wallet/fund` ✅

### Transactions:
- `GET /api/transactions` ✅
- `GET /api/transactions/:id` ✅

### Services:
- `POST /api/services/airtime` ✅
- `POST /api/services/data` ✅
- `POST /api/services/electricity` ✅

---

## 🎉 All Endpoints Are Now Available!

All the endpoints you asked for have been created and are ready to use!

