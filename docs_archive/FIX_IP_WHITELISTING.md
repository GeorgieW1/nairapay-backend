# 🔧 Fix IP Whitelisting & Portal Transactions

## 🔴 TWO Issues Found:

### Issue 1: Portal Transactions DISABLED ⚠️
Your VTpass account shows "Portal transactions are disabled" - this could block transactions!

### Issue 2: IP Whitelisting Required 🔐
Railway server IP needs to be whitelisted in VTpass.

---

## ✅ Solution 1: Enable Portal Transactions

### Step 1: Enable Portal Transactions

1. **Go to:** VTpass Sandbox Dashboard → Profile Details
2. **Find:** "Enable Portal Transactions" card (top left)
3. **Click** on the card (it shows "DISABLED")
4. **Enable** portal transactions
5. **Confirm** if prompted

**This is important!** Portal transactions must be enabled for API transactions to work.

---

## ✅ Solution 2: Fix IP Whitelisting

### Option A: Disable IP Whitelisting (Easiest for Testing)

**Best for sandbox/testing:**

1. **In VTpass Sandbox Dashboard:**
   - Go to **"Whitelist IP"** section
   - Look for option to **disable** IP whitelisting
   - If IP whitelisting is currently **DISABLED** (as shown in your dashboard), you're good! ✅

**If IP whitelisting is already disabled, skip to Option B.**

---

### Option B: Whitelist Railway IP (If Required)

**Railway uses dynamic IPs** (they change), so this is tricky. Here's how:

#### Step 1: Get Railway Server IP

Railway doesn't provide a static IP, but you can:

**Method 1: Check Railway Logs**
1. Go to Railway Dashboard → Your Project → Logs
2. Look for any IP addresses in logs
3. Or check Railway networking settings

**Method 2: Use Railway's Outbound IP**
Railway services use dynamic IPs. You may need to:

1. **Contact VTpass Support:**
   - Email: support@vtpass.com
   - Phone: 07080631810
   - Ask: "I'm using Railway hosting (dynamic IPs). How do I whitelist for sandbox testing?"
   - They might:
     - Allow you to disable IP whitelisting for sandbox
     - Provide a way to whitelist Railway's IP range
     - Give you alternative solution

**Method 3: Test Current IP**
1. Make a test API call from Railway
2. Check VTpass logs/dashboard for incoming IP
3. Whitelist that IP

#### Step 2: Complete IP Whitelisting Form

If you have the IP address:

1. **In VTpass Sandbox Dashboard:**
   - Go to **"Whitelist IP"** section
   - Click **"Manage IP Address"** card
   - Enter:
     - **OTP** (from email)
     - **Password** (VTpass account password)
     - **Server IP Address** (Railway IP)
   - Click **"Submit"**

---

## 🎯 Recommended Approach for Sandbox

**For sandbox/testing, VTpass usually allows:**

1. **Disable IP whitelisting** (easiest)
2. **Or whitelist:** `0.0.0.0/0` (all IPs) - if VTpass allows it

**Contact VTpass support** and ask:
> "I'm testing in sandbox with Railway hosting (dynamic IPs). Can I disable IP whitelisting for sandbox, or how should I whitelist Railway IPs?"

---

## ✅ Quick Checklist

**In VTpass Sandbox Dashboard:**

- [ ] **Enable Portal Transactions**
  - Go to Profile Details
  - Click "Enable Portal Transactions" card
  - Enable it ✅

- [ ] **Check IP Whitelisting Status**
  - If DISABLED → You're good! ✅
  - If ENABLED → Either disable it OR whitelist Railway IP

- [ ] **Verify Account Status**
  - Account should be "ACTIVE" ✅ (it is, based on your dashboard)

---

## 🔧 Alternative: Contact VTpass Support

If IP whitelisting is blocking you:

**Email VTpass Support:**
```
Subject: Sandbox IP Whitelisting for Railway Hosting

Hi VTpass Support,

I'm testing API integration in sandbox environment. My backend is hosted on Railway, which uses dynamic IP addresses.

Can you please:
1. Disable IP whitelisting for my sandbox account, OR
2. Provide guidance on how to whitelist Railway IPs for sandbox testing

Account: wonuola@gmail.com
Environment: Sandbox

Thank you!
```

**Contact Info:**
- Email: support@vtpass.com
- Phone: 07080631810

---

## 🎯 After Fixing

1. **Enable Portal Transactions** ✅
2. **Handle IP Whitelisting** ✅
3. **Test again** in Postman
4. **Should work now!** 🎉

---

## ⚠️ Important Notes

- **Sandbox** usually has relaxed IP restrictions
- **Live** will require proper IP whitelisting
- Railway IPs are **dynamic** (change), so static IP whitelisting won't work long-term
- For production, consider asking VTpass about Railway IP ranges or disable IP whitelisting if allowed

---

## 🚀 Next Steps

1. **Enable Portal Transactions** (most important!)
2. **Check IP whitelisting** status
3. **Contact VTpass** if needed for IP whitelisting guidance
4. **Test again** in Postman

**Start with enabling Portal Transactions - that's likely the main issue!** ✅






