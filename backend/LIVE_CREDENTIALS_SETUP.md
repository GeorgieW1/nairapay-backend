# 🔐 Live Credentials Setup Guide

This guide will help you configure live VTPass and Paystack credentials for production use.

## 📋 Credentials Provided

### VTPass (Live)
- **API Key**: `b8bed9a093539a61f851a69ac53cb45e`

### Paystack (Live)
- **Public Key**: `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548`
- **Secret Key**: `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`

---

## 🚀 Option 1: Automated Setup (Recommended)

Run the automated setup script to add VTPass integrations to the database:

### Steps:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Run the setup script**:
   ```bash
   node scripts/addLiveCredentials.js
   ```

3. **What it does**:
   - ✅ Deletes old VTPass integrations (sandbox)
   - ✅ Creates new live integrations for:
     - Airtime
     - Data
     - Electricity
     - TV/Cable
   - ✅ Sets mode to `live`
   - ✅ Sets base URL to `https://vtpass.com/api`
   - ✅ Adds API credentials

---

## 🔧 Option 2: Manual Setup via Admin Dashboard

### Step 1: Access Admin Dashboard
1. Go to: `https://nairapay-backend-production.up.railway.app/admin`
2. Login with admin credentials

### Step 2: Delete Old Integrations
1. Click **"🔌 Integrations"**
2. Delete any existing VTpass integrations

### Step 3: Add VTPass Integrations

#### For Airtime:
- **Provider Name**: `VTpass`
- **Category**: `airtime`
- **Mode**: `live`
- **Base URL**: `https://vtpass.com/api`
- **Credentials**:
  - **Label**: `API Key` | **Value**: `b8bed9a093539a61f851a69ac53cb45e`
  - **Label**: `Secret Key` | **Value**: `b8bed9a093539a61f851a69ac53cb45e`

#### For Data:
- **Provider Name**: `VTpass`
- **Category**: `data`
- **Mode**: `live`
- **Base URL**: `https://vtpass.com/api`
- **Credentials**: (same as airtime)

#### For Electricity:
- **Provider Name**: `VTpass`
- **Category**: `electricity`
- **Mode**: `live`
- **Base URL**: `https://vtpass.com/api`
- **Credentials**: (same as airtime)

#### For TV/Cable:
- **Provider Name**: `VTpass`
- **Category**: `tv`
- **Mode**: `live`
- **Base URL**: `https://vtpass.com/api`
- **Credentials**: (same as airtime)

---

## 💳 Paystack Configuration

### Update Environment Variables

You need to add Paystack keys to your environment configuration:

### Local Development (.env file):

Create or update `backend/.env`:

```env
# Database
MONGO_URI=your_mongodb_uri_here

# Authentication
JWT_SECRET=your_jwt_secret_here

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# Paystack (LIVE KEYS)
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221

# Firebase (Optional)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

### Railway/Render (Production):

1. **Railway**:
   - Go to your project dashboard
   - Click **"Variables"** tab
   - Add/Update:
     ```
     PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
     PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
     ```
   - Railway will automatically redeploy

2. **Render**:
   - Go to your service dashboard
   - Click **"Environment"** tab
   - Add/Update the same variables
   - Manually trigger redeploy

---

## ✅ Verification Checklist

After setup, verify everything is working:

### 1. Check VTPass Integrations
```bash
# Login to admin dashboard
# Navigate to Integrations
# Verify:
```
- [ ] Airtime integration exists (mode: live)
- [ ] Data integration exists (mode: live)
- [ ] Electricity integration exists (mode: live)
- [ ] TV integration exists (mode: live)
- [ ] Base URL is `https://vtpass.com/api`
- [ ] Credentials are properly masked in UI

### 2. Check Paystack Configuration
- [ ] Environment variables are set on production
- [ ] Server restarted after adding variables
- [ ] No errors in Railway/Render logs

### 3. Test Services

#### Test Wallet Funding (Paystack):
```bash
POST /api/wallet/paystack/initialize
Authorization: Bearer YOUR_USER_TOKEN

{
  "amount": 1000
}
```

Expected: Returns Paystack authorization URL

#### Test Airtime Purchase (VTPass):
```bash
POST /api/services/airtime
Authorization: Bearer YOUR_USER_TOKEN

{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 100
}
```

Expected: Transaction completed successfully

---

## 🔒 Security Notes

### VTPass Credentials
- ✅ Stored in MongoDB (Integration collection)
- ✅ Masked in admin UI
- ✅ Only accessible via authenticated admin routes
- ⚠️ **Note**: VTpass uses the same API key for both `api-key` and `secret-key` headers

### Paystack Credentials
- ✅ Stored as environment variables
- ✅ Never exposed in frontend
- ✅ Secret key only used server-side
- ⚠️ **Public key** is safe to use in frontend for Paystack popup

---

## 🧪 Testing in Production

### Safe Testing Approach:
1. Start with small amounts (₦50-100)
2. Test each service type:
   - ✅ Wallet funding
   - ✅ Airtime purchase
   - ✅ Data purchase
   - ✅ Electricity payment
3. Verify transaction status updates correctly
4. Check wallet balance deduction

### Test Numbers:
Use your own phone numbers for testing to verify airtime/data delivery.

---

## 🆘 Troubleshooting

### VTPass "INVALID CREDENTIALS" Error:
1. Verify API key is correct: `b8bed9a093539a61f851a69ac53cb45e`
2. Check mode is set to `live`
3. Verify base URL is `https://vtpass.com/api` (no trailing slash)
4. Ensure both `API Key` and `Secret Key` fields use the same value

### Paystack Not Working:
1. Check environment variables are set correctly
2. Verify server was restarted after adding variables
3. Check Railway/Render logs for errors
4. Ensure keys start with `PK_` (public) and `SK_` (secret)

### "Service not configured" Error:
- Integration not found in database
- Run the setup script again
- Or manually add via admin dashboard

---

## 📞 Support

### VTPass Support:
- Website: https://vtpass.com
- Email: support@vtpass.com
- Dashboard: https://vtpass.com/dashboard

### Paystack Support:
- Website: https://paystack.com
- Dashboard: https://dashboard.paystack.com
- Docs: https://paystack.com/docs

---

## 🎯 Quick Commands

```bash
# Run automated setup
cd backend
node scripts/addLiveCredentials.js

# Check server logs (Railway)
railway logs

# Restart server (Railway)
railway restart

# Test endpoint
curl -X POST https://nairapay-backend-production.up.railway.app/api/services/airtime \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone":"08012345678","network":"MTN","amount":100}'
```

---

## ✅ Setup Complete!

Your backend is now configured with:
- ✅ Live VTPass credentials (Airtime, Data, Electricity, TV)
- ✅ Live Paystack credentials (Wallet funding)
- ✅ Production-ready configuration

**Ready for live transactions! 🚀**
