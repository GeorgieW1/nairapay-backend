# 🔧 Fix VTpass Base URL Mismatch

## ❌ The Problem

Your Airtime integration has:
- **Mode:** `live` ✅
- **Base URL:** `https://sandbox.vtpass.com/api` ❌ **WRONG!**

**This mismatch causes "INVALID CREDENTIALS" error!**

---

## ✅ The Solution

### Option 1: Fix for Live/Production (Recommended)

1. **Delete** the existing Airtime integration (Row 1)
2. **Add new** integration with these settings:

```
Provider Name: VTpass
Category: airtime
Mode: live
Base URL: https://vtpass.com/api
Credentials:
  - API Key: (your live VTpass API key)
  - Secret Key: (your live VTpass Secret key)
```

**Important:** Use credentials from your **live VTpass account** (not sandbox)!

---

### Option 2: Test with Sandbox First

If you want to test with sandbox:

1. **Update** the existing integration:
   - Change **Mode:** `sandbox`
   - Keep **Base URL:** `https://sandbox.vtpass.com/api`
   - Make sure credentials are from **sandbox account**

OR

2. **Delete** and create new sandbox integration:
```
Provider Name: VTpass
Category: airtime
Mode: sandbox
Base URL: https://sandbox.vtpass.com/api
Credentials:
  - API Key: (your sandbox API key)
  - Secret Key: (your sandbox Secret key)
```

---

## 📋 VTpass URLs Reference

- **Sandbox:** `https://sandbox.vtpass.com/api`
- **Live/Production:** `https://vtpass.com/api`

**Always match Mode with Base URL!**

---

## 🔑 Credential Requirements

For **POST requests** (like buying airtime), you need:
- ✅ **API Key** (required)
- ✅ **Secret Key** (required)
- ❌ **Public Key** (NOT needed for POST requests)

---

## ✅ Quick Checklist

- [ ] Mode matches Base URL (live ↔ live URL, sandbox ↔ sandbox URL)
- [ ] Credentials match the environment (live credentials for live, sandbox for sandbox)
- [ ] Base URL is correct: `https://vtpass.com/api` for live
- [ ] API Key and Secret Key are present

---

## 🎯 After Fixing

Try your airtime purchase again in Postman - it should work now! ✅







