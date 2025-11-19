# 🔧 Fix MongoDB Connection Error

## ❌ Current Error:
```
MongoDB Connection Error: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Solution: Whitelist All IPs in MongoDB Atlas

Railway uses dynamic IPs that change, so you need to allow all IPs.

---

## 📋 Step-by-Step Fix:

### Step 1: Go to MongoDB Atlas

1. Go to **https://cloud.mongodb.com**
2. Sign in to your account
3. Select your cluster (the one with your database)

### Step 2: Network Access Settings

1. In the left sidebar, click **"Network Access"** (or **"Security"** → **"Network Access"**)
2. Click **"ADD IP ADDRESS"** button

### Step 3: Allow All IPs

1. In the "Add IP Address" popup:
   - Click **"ALLOW ACCESS FROM ANYWHERE"** button
   - OR manually add: `0.0.0.0/0`
   - This allows connections from any IP address

2. Click **"Confirm"**

### Step 4: Wait for Update

- MongoDB Atlas will update network access (takes 1-2 minutes)
- You'll see the new entry in the Network Access list

### Step 5: Railway Will Auto-Redeploy

- Once MongoDB whitelist is updated, Railway will retry connecting
- Check Railway logs - you should see: `✅ MongoDB Connected Successfully`

---

## ✅ What You Should See After Fix:

In Railway logs:
```
⚠️ Firebase not configured - Firebase login will be disabled
Connecting to MongoDB...
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

Then your URL should work:
```
https://nairapay-backend-production.up.railway.app/healthz
```

---

## 🔒 Security Note:

Allowing `0.0.0.0/0` means anyone can *attempt* to connect, but:
- They still need your **username and password** (from MONGO_URI)
- Your database user should have proper permissions
- For production, consider using MongoDB Atlas VPC peering (advanced)

For now, `0.0.0/0` is fine for development/testing!

---

## 🎯 Quick Checklist:

- [ ] Go to MongoDB Atlas
- [ ] Network Access → ADD IP ADDRESS
- [ ] Add `0.0.0.0/0` (or click "Allow from anywhere")
- [ ] Confirm
- [ ] Wait 1-2 minutes
- [ ] Check Railway logs for successful connection












