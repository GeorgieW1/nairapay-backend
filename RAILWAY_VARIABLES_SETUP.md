# 🚂 Railway Variables Setup - Exact Steps

## 📍 Where to Add Variables:

### ❌ DON'T Use: "Shared Variables"
### ✅ DO Use: "Variables" (Project-level)

## ✅ Step-by-Step:

### 1. In Railway Dashboard:
   - Click on your **project** (not the team settings)
   - You should see tabs: **Deployments | Metrics | Variables | Settings**
   - Click **"Variables"** tab (NOT "Shared Variables")

### 2. Add These Variables:

Click **"+ New Variable"** for each:

#### Variable 1: JWT_SECRET
```
Variable: JWT_SECRET
Value: c0ad259179bd8cc7279c576eff8253074e09c0feddb2043ae22f9f501d43d2bb
```

#### Variable 2: MONGO_URI
```
Variable: MONGO_URI
Value: mongodb+srv://george:d.VP8gW4ix-fM76@cluster0.nvcfre6.mongodb.net/nairapay?retryWrites=true&w=majority&appName=Cluster0
```

#### Variable 3: FRONTEND_ORIGIN
```
Variable: FRONTEND_ORIGIN
Value: *
```
(Use `*` for now - means allow all origins. Later, replace with your actual frontend URL like `https://your-frontend.vercel.app`)

---

## 🎯 Your URLs Explained:

### Backend URL (Railway):
- This will be: `https://your-app-name.railway.app`
- Example: `https://nairapay-backend-production.up.railway.app`
- This is where your API lives

### Frontend URL (Future - When you deploy frontend):
- This will be: `https://your-frontend.vercel.app` (or wherever you deploy)
- NOT `http://localhost:5000/admin` (that's local only)

### MongoDB URL (You provided):
- ✅ This is correct: `mongodb+srv://george:d.VP8gW4ix-fM76@cluster0.nvcfre6.mongodb.net/nairapay?retryWrites=true&w=majority&appName=Cluster0`

---

## ✅ Checklist:

In Railway → Your Project → **Variables** tab:

- [ ] `JWT_SECRET` = `c0ad259179bd8cc7279c576eff8253074e09c0feddb2043ae22f9f501d43d2bb`
- [ ] `MONGO_URI` = `mongodb+srv://george:d.VP8gW4ix-fM76@cluster0.nvcfre6.mongodb.net/nairapay?retryWrites=true&w=majority&appName=Cluster0`
- [ ] `FRONTEND_ORIGIN` = `*`

---

## 🚀 After Adding Variables:

1. Railway will **auto-redeploy** (or click "Redeploy" in Settings)
2. Check **Deployments** tab for progress
3. Wait for status: **"Live"** ✅
4. Test: `https://your-app.railway.app/healthz`

---

## 📝 Notes:

- **Shared Variables** = Team-wide (don't use for this)
- **Variables** (Project level) = For this specific project ✅
- `FRONTEND_ORIGIN = *` allows all origins (fine for testing)
- Later, change `FRONTEND_ORIGIN` to your actual frontend URL when deployed



