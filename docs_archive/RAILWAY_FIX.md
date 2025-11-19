# 🔧 Railway Fix - Environment Variables

## ❌ Current Error:
1. `JWT_SECRET is required` - Missing environment variable
2. Firebase error (should be fixed with latest code, but needs redeploy)

## ✅ Quick Fix Steps:

### Step 1: Add Missing Environment Variable

In Railway Dashboard:
1. Go to your project
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables:

```
Variable Name: JWT_SECRET
Value: c0ad259179bd8cc7279c576eff8253074e09c0feddb2043ae22f9f501d43d2bb
```

```
Variable Name: MONGO_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/nairapay
```
(Replace with your actual MongoDB connection string)

```
Variable Name: FRONTEND_ORIGIN
Value: *
```

### Step 2: Trigger Redeploy

After adding the variables:

**Option A: Manual Redeploy (Easiest)**
1. In Railway, go to your project
2. Click **"Settings"** tab
3. Scroll down and click **"Redeploy"** or **"Deploy"** button

**Option B: Auto-Redeploy**
- Railway should auto-redeploy when you push code (I just pushed a trigger)
- Wait 1-2 minutes and check the Deployments tab

### Step 3: Check Deployment Logs

After redeploy, check logs:
- You should see: `⚠️ Firebase not configured - Firebase login will be disabled`
- You should see: `✅ MongoDB Connected Successfully`
- You should see: `🚀 Server running on port 5000`

### Step 4: Test Health Endpoint

Visit: `https://your-app.railway.app/healthz`

Should return: `{"status":"ok"}`

---

## 📋 Environment Variables Checklist:

Make sure these are set in Railway:

- [x] `JWT_SECRET` = `c0ad259179bd8cc7279c576eff8253074e09c0feddb2043ae22f9f501d43d2bb`
- [x] `MONGO_URI` = Your MongoDB connection string
- [x] `FRONTEND_ORIGIN` = `*` (or your frontend URL)
- [ ] `FIREBASE_PRIVATE_KEY` (Optional - only if using Firebase)
- [ ] `FIREBASE_PROJECT_ID` (Optional - only if using Firebase)
- [ ] `FIREBASE_CLIENT_EMAIL` (Optional - only if using Firebase)

---

## 🚫 Don't Delete Deployment

**You don't need to delete and redeploy!** Just:
1. Add the missing `JWT_SECRET` variable
2. Trigger a redeploy (or wait for auto-redeploy)
3. Check logs

Deleting and redeploying will lose your configuration and you'll have to set everything up again.

---

## 🎯 After Fix:

Once `JWT_SECRET` is added and Railway redeploys:
- ✅ Server will start successfully
- ✅ Email/password login will work
- ✅ Firebase login will be disabled (unless you add Firebase vars)
- ✅ All API endpoints will work












