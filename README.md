# NairaPay Backend API

Backend API for NairaPay - Airtime, Data, and Utility Services Platform

## 💰 NairaPay Backend

A production-ready backend API for NairaPay - Nigerian fintech platform for airtime, data, utility payments, and wallet management.

## 🚀 Live URL
**Production:** https://nairapay-backend-production.up.railway.app

## ✨ Features

- 🔐 **User Authentication** - JWT-based auth with Firebase
- 💳 **Wallet Management** - Paystack integration for funding
- 📱 **Service Purchases** - Airtime, Data, Electricity via VTpass
- 📊 **Admin Dashboard** - Web-based admin panel
- 💾 **MongoDB Database** - Secure data storage
- 🔒 **Security** - Helmet, CORS, rate limiting

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + Firebase Admin SDK
- **Payments:** Paystack API
- **Services:** VTpass API
- **Security:** Helmet, CORS, express-rate-limit

## 📁 Project Structure

```
backend/
├── server.js              # Main application entry
├── config/                # Database & Firebase config
├── controllers/           # Business logic
│   ├── authController.js
│   ├── walletController.js
│   ├── serviceController.js
│   └── transactionController.js
├── models/                # MongoDB schemas
├── routes/                # API endpoints
├── middleware/            # Auth & validation
├── utils/                 # Helper functions
├── validators/            # Input validation
└── views/                 # Admin dashboard HTML
```

## 🔑 Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_jwt_secret_here

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# Paystack (Live Keys)
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221

# VTpass (Configured via Admin Panel or Setup Script)
# Keys stored in MongoDB Integration collection
# API Key: b8bed9a093539a61f851a69ac53cb45e
```

**📚 For complete setup instructions, see:**
- **Quick Setup**: `QUICK_START_LIVE.md` (5 minutes)
- **Complete Guide**: `backend/LIVE_CREDENTIALS_SETUP.md`
- **Environment Variables**: `ENV_VARIABLES_REFERENCE.md`

## 🚀 Quick Start

### Local Development
```bash
cd backend
npm install
npm start
```

Server runs on: http://localhost:5000

### Live Production Setup
```bash
# 1. Setup VTpass integrations
cd backend
node scripts/addLiveCredentials.js

# 2. Add Paystack keys to environment variables (Railway/Render)
# 3. Restart server and test
```

**See `QUICK_START_LIVE.md` for 5-minute setup guide**

### Admin Panel
Access at: http://localhost:5000/admin

## 📚 Documentation

### 🔥 Live Credentials Setup (NEW)
| Document | Purpose |
|----------|---------|
| `QUICK_START_LIVE.md` | ⚡ 5-minute production setup |
| `backend/LIVE_CREDENTIALS_SETUP.md` | 📖 Complete setup guide |
| `ENV_VARIABLES_REFERENCE.md` | 🔐 Environment variables |
| `DEPLOYMENT_CHECKLIST.md` | ✅ Production checklist |
| `CREDENTIALS_SUMMARY.md` | 📋 Credentials overview |
| `SETUP_FILES_README.md` | 📚 Documentation guide |
| `CREDENTIALS_ADDED.txt` | 🎯 Quick reference card |

### Original Documentation
| Document | Purpose |
|----------|---------|
| `API_DOCUMENTATION.md` | Complete API reference |
| `DEPLOYMENT.md` | Railway deployment guide |
| `START_HERE.md` | Setup instructions |
| `NEXT_STEPS.md` | Post-deployment checklist |
| `FLUTTER_PROMPT_FOR_LLM.md` | Flutter frontend prompt |
| `PAYSTACK_ONLY_PROMPT.md` | Paystack integration guide |
| `FRONTEND_PAYSTACK_INTEGRATION.md` | Frontend Paystack docs |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify JWT

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/paystack/initialize` - Start payment
- `GET /api/wallet/paystack/verify` - Verify payment

### Services
- `POST /api/services/airtime` - Buy airtime
- `POST /api/services/data` - Buy data
- `POST /api/services/electricity` - Pay electricity

### Transactions
- `GET /api/transactions` - Get transaction history

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/:id/fund` - Fund user wallet
- `GET /api/admin/integrations` - Manage API keys

## 🧪 Testing

### Test Credentials
**Admin Login:**
- Email: `admin@nairapay.com`
- Password: (Set via admin creation script)

**Paystack Test Card:**
- Card: `5060 6666 6666 6666 6666`
- Expiry: `12/25`
- CVV: `123`
- PIN: `1234`
- OTP: `123456`

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ MongoDB injection prevention

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "firebase-admin": "^11.0.0",
  "paystack": "^2.0.1",
  "node-fetch": "^2.6.7",
  "helmet": "^7.0.0",
  "cors": "^2.8.5",
  "express-rate-limit": "^6.7.0"
}
```

## 🚀 Deployment

Deployed on **Railway** with automatic deployments from GitHub.

**Railway Setup:**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 📝 License

Private project - All rights reserved

## 👨‍💻 Developer











