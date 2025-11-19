# 🚀 START HERE - Live Credentials Setup

**Welcome to NairaPay Live Credentials Setup!**

You have live VTPass and Paystack API keys ready to be integrated into your backend.

---

## 🎯 What You're Setting Up

### Live Credentials:
- ✅ **VTPass API Key**: For airtime, data, electricity, TV purchases
- ✅ **Paystack Keys**: For wallet funding and payments

### Result:
Production-ready backend that processes **real money transactions**.

---

## ⚡ Quick Start (5 Minutes)

### Option 1: I want the fastest setup possible
1. Open and follow: **`QUICK_START_LIVE.md`**
2. Run one command, add two environment variables
3. You're live!

### Option 2: I want to understand what I'm doing
1. Read: **`CREDENTIALS_SUMMARY.md`** (5 min overview)
2. Follow: **`backend/LIVE_CREDENTIALS_SETUP.md`** (detailed guide)
3. Deploy with confidence

---

## 📚 All Documentation Files

### 🏃 Fast Track
- **`QUICK_START_LIVE.md`** - 5-minute setup, minimal reading
- **`CREDENTIALS_ADDED.txt`** - Quick reference card

### 📖 Complete Guides
- **`backend/LIVE_CREDENTIALS_SETUP.md`** - Step-by-step setup
- **`DEPLOYMENT_CHECKLIST.md`** - Production deployment
- **`CREDENTIALS_SUMMARY.md`** - Overview and breakdown

### 🔧 Technical Reference
- **`ENV_VARIABLES_REFERENCE.md`** - All environment variables
- **`SETUP_FILES_README.md`** - Documentation guide
- **`backend/scripts/addLiveCredentials.js`** - Automated setup

---

## 🔑 Your Credentials (Quick Access)

**VTPass**:
```
API Key: b8bed9a093539a61f851a69ac53cb45e
Mode: live
URL: https://vtpass.com/api
```

**Paystack**:
```
Public Key: PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
Secret Key: SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
```

---

## 🚦 Choose Your Path

### Path A: Automated Setup (RECOMMENDED)
```bash
# Step 1: Run automated script
cd backend
node scripts/addLiveCredentials.js

# Step 2: Add Paystack keys to Railway/Render environment
# PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
# PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221

# Step 3: Server restarts automatically, you're done!
```

**Time**: ~3 minutes  
**Difficulty**: Easy  
**Best for**: Quick deployment

---

### Path B: Manual Setup via Admin Dashboard
1. Login to: `https://your-domain.com/admin`
2. Navigate to **Integrations**
3. Add VTpass integrations for each service (airtime, data, etc.)
4. Add Paystack keys to environment variables
5. Restart server

**Time**: ~10 minutes  
**Difficulty**: Easy  
**Best for**: Learning the system

---

### Path C: Complete Understanding
1. Read `CREDENTIALS_SUMMARY.md` - Understand the big picture
2. Read `ENV_VARIABLES_REFERENCE.md` - Learn environment setup
3. Read `backend/LIVE_CREDENTIALS_SETUP.md` - Detailed instructions
4. Use `DEPLOYMENT_CHECKLIST.md` - Verify everything
5. Deploy with full confidence

**Time**: ~30 minutes  
**Difficulty**: Thorough  
**Best for**: First-time production deployment

---

## ✅ What Happens After Setup

Once configured, your backend will:
1. ✅ Accept wallet funding via Paystack (live payments)
2. ✅ Process airtime purchases via VTPass
3. ✅ Process data bundle purchases via VTPass
4. ✅ Process electricity payments via VTPass
5. ✅ Process TV/cable subscriptions via VTPass
6. ✅ Handle real money transactions
7. ✅ Update wallet balances correctly
8. ✅ Record all transactions in database

---

## 🧪 Testing Your Setup

After setup, test with these endpoints:

### 1. Health Check
```bash
curl https://your-domain.com/healthz
```
Expected: `{"status":"ok"}`

### 2. Admin Dashboard
Visit: `https://your-domain.com/admin`
Verify: 4 VTpass integrations visible (all in "live" mode)

### 3. Small Transaction
Buy ₦50 airtime to test end-to-end flow

---

## 🆘 Need Help?

### Quick Answers:
- **"How do I add VTpass keys?"** → Run `node scripts/addLiveCredentials.js`
- **"Where do Paystack keys go?"** → Railway/Render environment variables
- **"How do I test?"** → See `QUICK_START_LIVE.md` testing section
- **"Something broke!"** → Check `backend/LIVE_CREDENTIALS_SETUP.md` troubleshooting

### Support:
- VTpass: support@vtpass.com
- Paystack: support@paystack.com
- Railway: https://railway.app/help

---

## 📋 Pre-Flight Checklist

Before you start, make sure you have:
- [ ] Backend deployed on Railway/Render
- [ ] MongoDB database running
- [ ] Admin access to deployment
- [ ] Can access admin dashboard
- [ ] MongoDB connection string ready
- [ ] JWT secret configured

**All set?** → Open `QUICK_START_LIVE.md` and start!

---

## 🎓 Learning Resources

### Understanding the System:
1. **Architecture**: How VTpass and Paystack integrate
2. **Security**: How credentials are stored safely
3. **Flow**: How transactions are processed
4. **Testing**: How to verify everything works

All explained in: `CREDENTIALS_SUMMARY.md`

---

## ⚠️ Important Notes

### Before You Deploy:
1. These are **LIVE credentials** - real money!
2. Test with **small amounts** first (₦50-100)
3. Monitor **first transactions** closely
4. Keep credentials **secure** (never commit to Git)
5. VTpass uses **same key** for api-key and secret-key
6. Server **must restart** after adding environment variables

### After You Deploy:
1. Monitor transaction success rates
2. Check error logs regularly
3. Verify settlements with VTpass/Paystack
4. Keep credentials backed up safely
5. Update frontend with production URL

---

## 🎯 Your Next Steps

### Right Now:
1. Choose your setup path (A, B, or C above)
2. Open the recommended documentation
3. Follow the steps
4. Test with small amounts
5. Go live!

### Recommended Order:
1. **Read**: `QUICK_START_LIVE.md` (5 min)
2. **Run**: Setup script or manual setup (3-10 min)
3. **Verify**: Check integrations in admin
4. **Test**: Small transaction (₦50)
5. **Monitor**: Watch logs for errors
6. **Deploy**: Update frontend to use production API

---

## 🏁 Ready to Start?

**For fastest deployment**: Open **`QUICK_START_LIVE.md`**

**For complete understanding**: Open **`backend/LIVE_CREDENTIALS_SETUP.md`**

**For credentials reference**: Open **`CREDENTIALS_SUMMARY.md`**

**For quick lookup**: Open **`CREDENTIALS_ADDED.txt`**

---

## 💡 Pro Tips

1. **Start simple**: Use automated script first
2. **Test small**: ₦50-100 test transactions
3. **Monitor closely**: Watch first 10-20 transactions
4. **Document issues**: Note any problems for debugging
5. **Keep backups**: Save all credentials securely
6. **Read logs**: Check Railway/Render logs regularly

---

## ✨ Success Metrics

After going live, track:
- Transaction success rate (target: >95%)
- API response time (target: <2s)
- Error rate (target: <1%)
- User feedback
- Settlement accuracy

---

## 🚀 Let's Get Started!

You have everything you need:
- ✅ Live credentials ready
- ✅ Setup scripts prepared
- ✅ Complete documentation
- ✅ Testing procedures
- ✅ Support contacts

**Next**: Open `QUICK_START_LIVE.md` and deploy in 5 minutes!

---

**Good luck with your deployment! 🎉**
