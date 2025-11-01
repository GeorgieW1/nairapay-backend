# 🚀 Railway Deployment - Quick Start

## ✅ Step-by-Step Instructions

### Step 1: Set Up Git Repository

Open PowerShell in your project folder (`C:\Users\Gearz\Documents\nairapay_back`) and run:

```powershell
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - NairaPay backend ready for deployment"
```

---

### Step 2: Create GitHub Repository

1. Go to **https://github.com** and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Name:** `nairapay-backend`
   - **Description:** "NairaPay Backend API"
   - Leave **empty** (don't add README, .gitignore, or license)
4. Click **"Create repository"**

---

### Step 3: Push to GitHub

After creating the repo, GitHub shows commands. Copy and run:

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/nairapay-backend.git

# Push code
git branch -M main
git push -u origin main
```

**Note:** If asked for credentials:
- **Username:** Your GitHub username
- **Password:** Use a GitHub Personal Access Token (not your password)
  - Get token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

### Step 4: Sign Up for Railway

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (one-click signup)
4. Authorize Railway access

---

### Step 5: Deploy on Railway

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `nairapay-backend` repository
4. Railway will detect it's Node.js

---

### Step 6: Configure Project

#### 6a. Set Root Directory
1. Click on your project
2. Go to **Settings** tab
3. Find **Root Directory**
4. Set it to: `backend` (because your server.js is in the backend folder)

#### 6b. Add Environment Variables
Click **Variables** tab → Add these:

**1. MONGO_URI** (Required)
```
mongodb+srv://username:password@cluster.mongodb.net/nairapay
```
*If you don't have MongoDB yet, see MongoDB setup below*

**2. JWT_SECRET** (Required)
```
c0ad259179bd8cc7279c576eff8253074e09c0feddb2043ae22f9f501d43d2bb
```
*This is a generated secret - use this one or generate your own*

**3. FRONTEND_ORIGIN** (Required)
```
*
```
*Use `*` for now (or your frontend URL if you have one)*

**4. PORT** (Optional - Railway sets automatically)
```
5000
```

---

### Step 7: MongoDB Setup (if needed)

If you don't have MongoDB Atlas:

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Sign up (free account)
3. Create **free cluster** (M0 - Shared)
4. Wait for cluster to finish (1-2 minutes)
5. Click **"Connect"** → **"Connect your application"**
6. Copy connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your database user
8. Add `/nairapay` at the end (before `?`)
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nairapay?retryWrites=true&w=majority
   ```
9. Use this as `MONGO_URI` in Railway

**Important MongoDB Settings:**
- **Network Access:** Add IP `0.0.0.0/0` (allows all IPs)
- **Database Access:** Create a user with username/password

---

### Step 8: Deploy!

1. Railway will auto-start deploying
2. Watch **Deployments** tab
3. Wait for status: **"Live"** ✅ (takes 2-3 minutes)

---

### Step 9: Get Your API URL

1. Click **Settings** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `nairapay-backend-production.up.railway.app`)

**This is your backend URL!** 🎉

---

### Step 10: Test It

Open in browser:
```
https://your-app.railway.app/healthz
```

Should show: `{"status":"ok"}`

---

## 🎯 Your API Endpoints

**Base URL:** `https://your-app.railway.app`

- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Users: `GET /api/admin/users`
- Health: `GET /healthz`

---

## 📝 Checklist

- [ ] Git initialized and pushed to GitHub
- [ ] Railway account created
- [ ] Project deployed on Railway
- [ ] Root Directory set to `backend`
- [ ] Environment variables added:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] FRONTEND_ORIGIN
- [ ] MongoDB Atlas set up (if needed)
- [ ] Health endpoint tested
- [ ] Backend URL copied

---

## 🐛 Common Issues

**"Build Failed"**
→ Check Root Directory is set to `backend`

**"Cannot connect to MongoDB"**
→ Check MONGO_URI format and MongoDB Network Access settings

**"500 Error"**
→ Check Railway logs (Deployments → View Logs)

---

## 💡 Need More Help?

See `RAILWAY_DEPLOY_GUIDE.md` for detailed instructions.


