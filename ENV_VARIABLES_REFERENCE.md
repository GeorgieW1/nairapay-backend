# 🔐 Environment Variables Reference

Quick reference for all environment variables needed by NairaPay Backend.

## 📝 Complete .env File Template

```env
# ============================================
# DATABASE
# ============================================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nairapay?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# ============================================
# CORS (Frontend)
# ============================================
FRONTEND_ORIGIN=http://localhost:3000
# Production: https://your-frontend-domain.com

# ============================================
# PAYSTACK (LIVE KEYS)
# ============================================
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221

# ============================================
# FIREBASE (Optional - for Firebase Auth)
# ============================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# ============================================
# SERVER (Optional - defaults to 5000)
# ============================================
PORT=5000
```

---

## 🔑 Your Live Credentials

### VTPass
**Note**: VTPass credentials are stored in MongoDB, not .env file. Add via admin dashboard or setup script.

- **API Key**: `b8bed9a093539a61f851a69ac53cb45e`
- **Mode**: `live`
- **Base URL**: `https://vtpass.com/api`

### Paystack
- **Public Key**: `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548`
- **Secret Key**: `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`

---

## 🚀 Railway Environment Variables

Set these in your Railway project dashboard:

```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
FRONTEND_ORIGIN=<your-frontend-url>
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
```

Optional (for Firebase):
```
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_CLIENT_EMAIL=<your-firebase-email>
FIREBASE_PRIVATE_KEY=<your-firebase-private-key>
```

---

## 🔍 Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT token generation |
| `FRONTEND_ORIGIN` | ⚠️ Recommended | CORS allowed origin (or use `*` for all) |
| `PAYSTACK_PUBLIC_KEY` | ✅ Yes | Paystack public key (starts with PK_) |
| `PAYSTACK_SECRET_KEY` | ✅ Yes | Paystack secret key (starts with SK_) |
| `FIREBASE_PROJECT_ID` | ❌ Optional | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ❌ Optional | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ❌ Optional | Firebase private key |
| `PORT` | ❌ Optional | Server port (default: 5000) |

---

## 📦 How to Use

### Local Development:
1. Create `backend/.env` file
2. Copy template above
3. Fill in your values
4. Run: `npm start`

### Production (Railway):
1. Go to Railway project → Variables tab
2. Add each variable individually
3. Railway auto-redeploys on save

### Production (Render):
1. Go to service → Environment tab
2. Add each variable
3. Manually trigger redeploy

---

## ⚠️ Security Warnings

### Never commit .env file to Git!
```bash
# .gitignore should contain:
.env
.env.local
.env.production
```

### Keep secrets safe:
- ❌ Don't share in chat/email
- ❌ Don't commit to GitHub
- ❌ Don't expose in frontend
- ✅ Use environment variables
- ✅ Rotate keys if exposed

---

## 🧪 Testing Configuration

### Check if environment variables are loaded:
```javascript
// In any backend file
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('PAYSTACK_PUBLIC_KEY:', process.env.PAYSTACK_PUBLIC_KEY ? '✅ Loaded' : '❌ Missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');
```

### Or create a test endpoint:
```javascript
// backend/server.js
app.get('/api/health/config', (req, res) => {
  res.json({
    mongodb: !!process.env.MONGO_URI,
    jwt: !!process.env.JWT_SECRET,
    paystack_public: !!process.env.PAYSTACK_PUBLIC_KEY,
    paystack_secret: !!process.env.PAYSTACK_SECRET_KEY,
    firebase: !!process.env.FIREBASE_PROJECT_ID
  });
});
```

---

## 📋 Checklist

Before deploying to production:

- [ ] All required variables are set
- [ ] Paystack keys are LIVE keys (not test)
- [ ] MONGO_URI points to production database
- [ ] JWT_SECRET is strong and unique
- [ ] FRONTEND_ORIGIN matches your frontend URL
- [ ] Firebase variables set (if using Firebase auth)
- [ ] .env file is in .gitignore
- [ ] Server restarts successfully with new variables

---

## 🔄 Quick Setup Commands

```bash
# Create .env file
cat > backend/.env << 'EOF'
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:3000
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
EOF

# Start server
cd backend
npm start
```

---

## ✅ You're Ready!

With these environment variables configured:
- ✅ Database connection works
- ✅ JWT authentication works
- ✅ Paystack wallet funding works
- ✅ CORS allows frontend requests
- ✅ Firebase auth works (if configured)

**Next**: Run `node scripts/addLiveCredentials.js` to setup VTPass! 🚀
