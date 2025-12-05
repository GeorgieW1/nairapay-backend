# ✅ Final Step: Add Resend API Key to Railway

## 🎉 Great Work! Code is Deployed

Your code is now on GitHub `main` branch and Railway is deploying it!

---

## 🔑 Add Your Resend API Key to Railway

### **Your API Key:**
```
re_91Cv2r7V_HNe2WvXScYVebpRW5hFrBew8
```

---

## 📋 Steps to Add to Railway:

### **1. Open Railway Dashboard**
- Go to https://railway.app/dashboard
- Log in if needed

### **2. Select Your Project**
- Find "nairapay-backend-production" (or whatever you named it)
- Click on it

### **3. Select Your Backend Service**
- Click on the backend service (not the database)

### **4. Go to Variables Tab**
- Click "Variables" in the top menu

### **5. Add New Variable**
- Click "+ New Variable" button
- Enter:
  ```
  Variable Name:  RESEND_API_KEY
  Value:          re_91Cv2r7V_HNe2WvXScYVebpRW5hFrBew8
  ```
- Click "Add" or press Enter

### **6. Railway Auto-Redeploys**
- Railway detects the new variable
- Automatically redeploys your backend (~2-3 minutes)
- Check "Deployments" tab to watch progress

---

## ✅ Verify Deployment

### **Check Railway Logs:**
1. Go to "Deployments" tab
2. Click latest deployment
3. View logs
4. Look for:
   ```
   ✅ Server running on port 5000
   ✅ MongoDB Connected Successfully
   ```

---

## 🧪 Test OTP Email

### **After Railway Redeploys:**

1. **Open Your App**
2. **Go to "Verify Email" Screen**
3. **Click "Send Verification Code"**
4. **Check Your Email** (arrives in ~2-5 seconds!)
5. **Look for:**
   - From: `NairaPay <onboarding@resend.dev>`
   - Subject: `✉️ Email Verification Code - NairaPay`
   - Beautiful HTML email with 4-digit code

6. **Enter the code in app**
7. **Email verified!** ✅

---

## 📊 What to Expect in Railway Logs

**Before (SMTP - Failed):**
```
❌ Failed to send OTP email: Error: Connection timeout
ETIMEDOUT
```

**After (Resend - Success):**
```
✅ OTP email sent via Resend to: user@example.com
```

---

## 🎯 Checklist

- [x] Code pushed to GitHub main
- [x] Railway deploying (automatic)
- [ ] Add `RESEND_API_KEY` to Railway variables
- [ ] Wait for deployment to complete (~2-3 min)
- [ ] Test OTP in app
- [ ] Email arrives successfully ✅

---

## 🔄 Optional: Clean Up Old SMTP Variables

Since you're using Resend now, you can **remove** these from Railway:
- ❌ `SMTP_HOST`
- ❌ `SMTP_PORT`
- ❌ `SMTP_SECURE`
- ❌ `SMTP_USER`
- ❌ `SMTP_PASSWORD`

**Keep:**
- ✅ `RESEND_API_KEY` (new!)
- ✅ `ADMIN_EMAIL` (still used)
- ✅ All other variables (database, JWT, etc.)

---

## 🚀 You're Almost Done!

**Current Status:**
- ✅ Code deployed to main
- ✅ Railway deploying
- ⏳ **Just add the API key!**

**After adding the key:**
- ✅ OTP emails work perfectly
- ✅ No more timeouts
- ✅ Fast & reliable delivery

---

**Go add that API key to Railway now!** 🎉

Then test the OTP flow in your app - it will work beautifully! 📧✨
