# 📚 Setup Files Guide

Quick reference for all credential setup documentation.

## 🎯 Which File Should I Read?

### 🚀 I want to deploy NOW (5 minutes)
→ Read: **`QUICK_START_LIVE.md`**
- Fastest way to go live
- Minimal steps
- Quick testing

### 📖 I want complete setup instructions
→ Read: **`backend/LIVE_CREDENTIALS_SETUP.md`**
- Detailed step-by-step guide
- Both automated and manual options
- Troubleshooting included
- Verification procedures

### 🔐 I need environment variable reference
→ Read: **`ENV_VARIABLES_REFERENCE.md`**
- Complete .env template
- All variable descriptions
- Railway/Render setup
- Security guidelines

### ✅ I'm deploying to production
→ Read: **`DEPLOYMENT_CHECKLIST.md`**
- Pre-deployment checklist
- Step-by-step deployment
- Testing procedures
- Monitoring setup
- Rollback plan

### 📋 I need credentials overview
→ Read: **`CREDENTIALS_SUMMARY.md`**
- All credentials in one place
- Configuration breakdown
- File structure explanation
- Support resources

---

## 📁 File Organization

```
nairapay_back/
│
├── QUICK_START_LIVE.md              ⚡ Fast 5-minute setup
├── CREDENTIALS_SUMMARY.md           📋 Credentials overview
├── ENV_VARIABLES_REFERENCE.md       🔐 Environment variables
├── DEPLOYMENT_CHECKLIST.md          ✅ Production deployment
├── SETUP_FILES_README.md            📚 This file
│
└── backend/
    ├── LIVE_CREDENTIALS_SETUP.md    📖 Complete setup guide
    │
    └── scripts/
        └── addLiveCredentials.js    🤖 Automated setup script
```

---

## 🔑 Your Live Credentials

### Quick Reference:

**VTpass**:
- API Key: `b8bed9a093539a61f851a69ac53cb45e`
- Mode: `live`
- URL: `https://vtpass.com/api`

**Paystack**:
- Public: `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548`
- Secret: `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`

---

## 🚀 Quick Setup (Choose One)

### Option A: Automated (Recommended)
```bash
cd backend
node scripts/addLiveCredentials.js
```
Then add Paystack keys to Railway/Render environment variables.

### Option B: Manual
1. Login to admin dashboard
2. Add VTpass integrations manually
3. Add Paystack keys to environment variables

---

## 📖 Reading Order (For New Setup)

If you're setting up from scratch, read in this order:

1. **CREDENTIALS_SUMMARY.md** (5 min)
   - Understand what credentials you have
   - See the big picture

2. **ENV_VARIABLES_REFERENCE.md** (5 min)
   - Understand environment variables
   - Prepare .env file structure

3. **QUICK_START_LIVE.md** (10 min)
   - Follow the fast setup
   - Get backend running

4. **DEPLOYMENT_CHECKLIST.md** (As needed)
   - Use for production deployment
   - Follow testing procedures

5. **backend/LIVE_CREDENTIALS_SETUP.md** (Reference)
   - Deep dive when needed
   - Troubleshooting reference

---

## 🎓 Learning Path

### Beginner (Never deployed before)
1. Read: `CREDENTIALS_SUMMARY.md`
2. Read: `ENV_VARIABLES_REFERENCE.md`
3. Follow: `backend/LIVE_CREDENTIALS_SETUP.md` (manual setup)
4. Use: `DEPLOYMENT_CHECKLIST.md` to verify

### Intermediate (Some deployment experience)
1. Read: `QUICK_START_LIVE.md`
2. Run: `backend/scripts/addLiveCredentials.js`
3. Reference: `DEPLOYMENT_CHECKLIST.md` for testing

### Advanced (Experienced developer)
1. Scan: `CREDENTIALS_SUMMARY.md`
2. Run: Setup script
3. Add env vars
4. Deploy

---

## 🔍 Finding Information Fast

### "How do I add VTpass credentials?"
→ **`QUICK_START_LIVE.md`** Step 1
→ Or run: `node scripts/addLiveCredentials.js`

### "What environment variables do I need?"
→ **`ENV_VARIABLES_REFERENCE.md`** (Complete template)

### "How do I test if it's working?"
→ **`DEPLOYMENT_CHECKLIST.md`** (Testing section)
→ **`QUICK_START_LIVE.md`** (Quick test section)

### "What are the Paystack keys?"
→ **`CREDENTIALS_SUMMARY.md`** (Top of file)
→ **`ENV_VARIABLES_REFERENCE.md`** (Your Live Credentials)

### "Something's not working, help!"
→ **`backend/LIVE_CREDENTIALS_SETUP.md`** (Troubleshooting section)
→ **`DEPLOYMENT_CHECKLIST.md`** (Rollback plan)

---

## 🛠️ Setup Script Details

### Location
`backend/scripts/addLiveCredentials.js`

### What it does
- Connects to MongoDB
- Deletes old VTpass integrations
- Creates 4 new live integrations:
  - Airtime
  - Data
  - Electricity
  - TV/Cable
- Displays Paystack setup instructions

### How to run
```bash
cd backend
node scripts/addLiveCredentials.js
```

### Output
```
✅ Connected to MongoDB
🗑️ Deleted X existing VTpass integrations
✅ Created VTpass airtime integration
✅ Created VTpass data integration
✅ Created VTpass electricity integration
✅ Created VTpass tv integration
💳 PAYSTACK LIVE CREDENTIALS
   Add these to your .env file...
```

---

## ⚙️ Environment Variables

### Required Variables
```env
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
```

### Where to add
- **Local**: `backend/.env` file
- **Railway**: Project → Variables tab
- **Render**: Service → Environment tab

---

## ✅ Setup Checklist

Quick checklist to verify you're ready:

- [ ] Read appropriate documentation
- [ ] Have MongoDB connection string
- [ ] Have JWT secret
- [ ] VTpass integrations added (via script or manually)
- [ ] Paystack keys added to environment
- [ ] Server deployed and running
- [ ] Health check passes
- [ ] Can access admin dashboard
- [ ] Integrations visible in admin
- [ ] Tested wallet funding
- [ ] Tested service purchase

---

## 🆘 Quick Troubleshooting

### Setup script fails
→ Check MongoDB connection string
→ Ensure `MONGO_URI` in .env

### Can't access admin dashboard
→ Verify server is running
→ Check deployment logs

### "Service not configured" error
→ Run setup script again
→ Or add integrations manually

### Paystack not working
→ Verify environment variables set
→ Restart server after adding vars

---

## 📞 Support

### Technical Documentation
- VTpass API: https://www.vtpass.com/documentation
- Paystack API: https://paystack.com/docs

### Support Contacts
- VTpass: support@vtpass.com
- Paystack: support@paystack.com

### Hosting Support
- Railway: https://railway.app/help
- Render: support@render.com

---

## 🎯 Summary

**5 Documentation Files**:
1. `QUICK_START_LIVE.md` - Fast setup
2. `CREDENTIALS_SUMMARY.md` - Overview
3. `ENV_VARIABLES_REFERENCE.md` - Environment vars
4. `DEPLOYMENT_CHECKLIST.md` - Production guide
5. `backend/LIVE_CREDENTIALS_SETUP.md` - Complete guide

**1 Setup Script**:
- `backend/scripts/addLiveCredentials.js`

**All Ready For**:
- ✅ Production deployment
- ✅ Live transactions
- ✅ Real customers

---

**Start Here**: Open `QUICK_START_LIVE.md` and follow the 5-minute guide!
