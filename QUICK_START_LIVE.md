# 🚀 Quick Start - Go Live in 5 Minutes

Fast track guide to deploy NairaPay backend with live credentials.

## ⚡ Prerequisites
- Backend deployed on Railway/Render
- MongoDB database ready
- Admin access to server

---

## 📝 Step-by-Step (5 Minutes)

### Step 1: Setup VTPass (2 minutes)

Connect to your server and run:

```bash
cd backend
node scripts/addLiveCredentials.js
```

**What it does**:
- ✅ Deletes old sandbox integrations
- ✅ Creates 4 live VTpass integrations (airtime, data, electricity, tv)
- ✅ Configures with live API key
- ✅ Sets base URL to production

**Expected Output**:
```
✅ Created VTpass airtime integration
✅ Created VTpass data integration
✅ Created VTpass electricity integration
✅ Created VTpass tv integration
```

---

### Step 2: Add Paystack Keys (2 minutes)

#### On Railway:
1. Go to your project dashboard
2. Click **"Variables"** tab
3. Add these two variables:
   ```
   PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
   PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
   ```
4. Railway auto-redeploys ✅

#### On Render:
1. Go to service dashboard
2. Click **"Environment"** tab
3. Add the same two variables
4. Click **"Save Changes"**
5. Manually trigger redeploy

---

### Step 3: Verify Setup (1 minute)

#### Check Health:
```bash
curl https://your-domain.com/healthz
```
Expected: `{"status":"ok"}`

#### Check Integrations:
1. Login to admin: `https://your-domain.com/admin`
2. Click **"Integrations"**
3. Verify you see 4 VTpass integrations with mode: **live**

---

## ✅ You're Live!

Your backend is now configured for production transactions.

### What's Working:
- ✅ Wallet funding via Paystack
- ✅ Airtime purchases via VTpass
- ✅ Data purchases via VTpass
- ✅ Electricity payments via VTpass
- ✅ TV/Cable subscriptions via VTpass

---

## 🧪 Quick Test

### Test Airtime Purchase:

1. **Register a test user** (if needed):
```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "phone": "08012345678"
  }'
```

2. **Login to get token**:
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

3. **Fund wallet** (use Paystack popup in frontend)

4. **Buy airtime**:
```bash
curl -X POST https://your-domain.com/api/services/airtime \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "08012345678",
    "network": "MTN",
    "amount": 50
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "status": "completed",
    "amount": 50,
    "description": "Airtime purchase - MTN 08012345678"
  }
}
```

---

## 🔍 Troubleshooting

### "Service not configured" error?
→ Run the setup script again: `node scripts/addLiveCredentials.js`

### "INVALID CREDENTIALS" error?
→ Verify VTpass API key in admin dashboard matches: `b8bed9a093539a61f851a69ac53cb45e`

### Paystack not working?
→ Check environment variables are set correctly and server restarted

### Still issues?
→ Check server logs:
```bash
railway logs  # on Railway
# or check Render dashboard
```

---

## 📚 Full Documentation

For detailed setup and configuration:
- **Setup Guide**: `backend/LIVE_CREDENTIALS_SETUP.md`
- **Environment Variables**: `ENV_VARIABLES_REFERENCE.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **API Documentation**: `API_DOCUMENTATION.md`

---

## 🎯 Summary

**What You Did**:
1. ✅ Ran automated setup script (30 seconds)
2. ✅ Added Paystack environment variables (1 minute)
3. ✅ Verified deployment (30 seconds)

**Result**:
🚀 **Production-ready backend with live credentials!**

---

## 💡 Next Steps

1. **Test all services** thoroughly
2. **Monitor first transactions** closely
3. **Update frontend** with production API URL
4. **Enable monitoring** on Railway/Render
5. **Setup alerts** for errors

---

## 📞 Support

**Technical Issues**:
- VTpass: support@vtpass.com
- Paystack: support@paystack.com
- Railway: https://railway.app/help

**Emergency**:
- Check logs first: `railway logs` or Render dashboard
- Verify credentials in admin dashboard
- Test with small amounts first

---

**🎉 Congratulations! You're ready for production! 🎉**
