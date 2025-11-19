# 🔴 CRITICAL: Sandbox vs Live Credentials Mismatch

## ❌ The Problem

You're getting "INVALID CREDENTIALS" because:

- ✅ **Backend is configured for:** `sandbox` mode
- ✅ **Backend Base URL:** `https://sandbox.vtpass.com/api`
- ❌ **But you're using credentials from:** LIVE VTpass dashboard (`vtpass.com`)

**This is a mismatch!** Sandbox credentials won't work with live API, and live credentials won't work with sandbox API.

---

## ✅ Solution: Use Sandbox Credentials

### Step 1: Access VTpass Sandbox Dashboard

1. **Go to:** https://sandbox.vtpass.com
2. **Login** with your sandbox account
   - If you don't have a sandbox account, **sign up** at https://sandbox.vtpass.com

### Step 2: Get Sandbox API Credentials

1. In sandbox dashboard, go to **"API SETTINGS"** tab
2. Or click **"API Keys"** in the left sidebar
3. **Generate** or **copy** your sandbox credentials:
   - **API Key** (static, generated once)
   - **Secret Key** (regenerate if needed)

### Step 3: Update Integration in Admin Dashboard

1. **Go to:** `https://nairapay-backend-production.up.railway.app/admin`
2. **Login** to admin dashboard
3. **Click:** "Integrations"
4. **Find** your Airtime integration
5. **Delete** it (if credentials are wrong)
6. **Add new** integration with:
   - **Provider Name:** `VTpass`
   - **Category:** `airtime`
   - **Mode:** `sandbox` ✅
   - **Base URL:** `https://sandbox.vtpass.com/api` ✅
   - **Credentials:**
     - Label: `API Key` → Value: Your **SANDBOX** API Key
     - Label: `Secret Key` → Value: Your **SANDBOX** Secret Key

---

## 🔄 Alternative: Switch to Live Mode

If you want to use LIVE credentials instead:

### Step 1: Update Integration to Live Mode

1. **Go to admin dashboard**
2. **Delete** sandbox integration
3. **Add new** integration with:
   - **Mode:** `live` ✅
   - **Base URL:** `https://vtpass.com/api` ✅ (NOT sandbox!)
   - **Credentials:** Use LIVE credentials from https://vtpass.com

### Step 2: Update Code (if needed)

The code already prioritizes live mode, so this should work automatically once you create a live integration.

---

## 📋 Quick Checklist

### For Sandbox Testing:
- [ ] Login to https://sandbox.vtpass.com (NOT vtpass.com)
- [ ] Get API Key from sandbox dashboard
- [ ] Get Secret Key from sandbox dashboard
- [ ] Integration Mode: `sandbox`
- [ ] Integration Base URL: `https://sandbox.vtpass.com/api`
- [ ] Use sandbox credentials ✅

### For Live Production:
- [ ] Login to https://vtpass.com (live dashboard)
- [ ] Get API Key from live dashboard
- [ ] Get Secret Key from live dashboard
- [ ] Integration Mode: `live`
- [ ] Integration Base URL: `https://vtpass.com/api` (NOT sandbox!)
- [ ] Use live credentials ✅

---

## 🎯 What You Need to Do RIGHT NOW

1. **Go to:** https://sandbox.vtpass.com
2. **Login** (or sign up if you don't have account)
3. **Go to:** "API SETTINGS" or "API Keys"
4. **Copy** your **SANDBOX** API Key and Secret Key
5. **Go to:** Admin dashboard → Integrations
6. **Update** Airtime integration with **sandbox credentials**
7. **Test again** in Postman ✅

---

## ⚠️ Important Notes

- **Sandbox** credentials are different from **Live** credentials
- **Sandbox** = for testing (free, test environment)
- **Live** = for production (real money, real transactions)
- You **CANNOT** mix sandbox credentials with live API or vice versa

---

## 🆘 Don't Have Sandbox Account?

1. **Sign up** at https://sandbox.vtpass.com
2. **Verify** your email
3. **Go to** API Settings
4. **Generate** API Key and Secret Key
5. **Use** those credentials in your integration

---

## ✅ After Fixing

Once you use the correct credentials (sandbox credentials for sandbox mode), your airtime purchase should work! 🎉






