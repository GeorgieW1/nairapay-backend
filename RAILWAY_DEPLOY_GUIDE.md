# 🚂 Railway Deployment Guide - Step by Step

## ✅ Step 1: Initialize Git Repository

Open terminal in your project folder and run:

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - ready for Railway deployment"
```

---

## ✅ Step 2: Push to GitHub

### 2a. Create GitHub Repository

1. Go to https://github.com
2. Sign in (or create account if you don't have one)
3. Click the **"+"** icon in top right → **"New repository"**
4. Fill in:
   - **Repository name:** `nairapay-backend` (or any name you like)
   - **Description:** "NairaPay Backend API"
   - **Visibility:** Choose Public or Private
   - **DON'T** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### 2b. Push Your Code

After creating the repo, GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/nairapay-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If you get authentication errors:**
- Use GitHub Personal Access Token instead of password
- Or use GitHub Desktop (easier for beginners)

---

## ✅ Step 3: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (easiest - one click)
4. Authorize Railway to access your GitHub account

---

## ✅ Step 4: Deploy Your App

### 4a. Create New Project

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `nairapay-backend` repository
4. Railway will automatically detect it's a Node.js project

### 4b. Configure Settings

Railway will auto-detect your settings, but check:

1. Click on your project
2. Click **"Settings"** tab
3. Check **Root Directory:**
   - If your backend is in `backend/` folder, set Root Directory to: `backend`
   - If it's at root, leave it empty

### 4c. Add Environment Variables

1. Still in your project, click **"Variables"** tab
2. Click **"New Variable"** and add these one by one:

#### Required Variables:

```
MONGO_URI
```
**Value:** Your MongoDB connection string
- If you don't have one yet, see "MongoDB Setup" section below

```
JWT_SECRET
```
**Value:** Generate a random secret (32+ characters)
- Run this in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copy the output and use it as value

```
FRONTEND_ORIGIN
```
**Value:** Your frontend URL (if you have one)
- Example: `https://your-frontend.vercel.app`
- Or use `*` for now (less secure, but works for testing)

```
PORT
```
**Value:** `5000` (Railway sets this automatically, but good to have)

#### Optional (if using Firebase):

```
FIREBASE_PROJECT_ID
```
```
FIREBASE_CLIENT_EMAIL
```
```
FIREBASE_PRIVATE_KEY
```
(Paste the full private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

---

## ✅ Step 5: MongoDB Setup (if needed)

If you don't have MongoDB yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for **free** account
3. Create a **free cluster** (M0 - Shared)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `nairapay` (or any name)
8. Add this as `MONGO_URI` in Railway variables

**Example format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/nairapay?retryWrites=true&w=majority
```

**Important:** In MongoDB Atlas:
- Go to **Network Access** → Add IP Address → Add `0.0.0.0/0` (allows all IPs)
- Go to **Database Access** → Create user with username/password

---

## ✅ Step 6: Deploy!

1. Railway will automatically start deploying
2. Watch the **Deployments** tab for progress
3. Wait for status to show **"Live"** ✅

---

## ✅ Step 7: Get Your Backend URL

1. In your Railway project, click **"Settings"**
2. Scroll down to **"Domains"** section
3. Click **"Generate Domain"** (free custom domain)
4. Copy the URL (looks like: `nairapay-backend-production.up.railway.app`)

**This is your API base URL!** 🎉

---

## ✅ Step 8: Test Your API

Test the health endpoint:
```bash
curl https://your-app.railway.app/healthz
```

Or visit in browser:
```
https://your-app.railway.app/healthz
```

Should return: `{"status":"ok"}`

---

## ✅ Step 9: Update Your Frontend

Now update your frontend to use this URL:

```javascript
// In your frontend code
const API_BASE = "https://your-app.railway.app";
```

Or use environment variable:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

---

## 🎯 Your API Endpoints

Once deployed, your endpoints will be:

**Base URL:** `https://your-app.railway.app`

- Login: `POST https://your-app.railway.app/api/auth/login`
- Register: `POST https://your-app.railway.app/api/auth/register`
- Verify Token: `POST https://your-app.railway.app/api/auth/verify-token`
- Admin Users: `GET https://your-app.railway.app/api/admin/users`
- Health: `GET https://your-app.railway.app/healthz`

---

## 🐛 Troubleshooting

### "Build Failed"
- Check Railway logs (Deployments → View Logs)
- Make sure `package.json` has `"start": "node server.js"`
- Ensure Root Directory is set correctly

### "Cannot connect to MongoDB"
- Verify `MONGO_URI` format is correct
- Check MongoDB Atlas Network Access allows all IPs (`0.0.0.0/0`)
- Verify database user password is correct

### "500 Internal Server Error"
- Check Railway logs
- Verify all environment variables are set
- Check JWT_SECRET is set

### "CORS Error"
- Make sure `FRONTEND_ORIGIN` is set correctly
- Should match your frontend URL exactly (no trailing slash)

---

## 💡 Pro Tips

1. **Monitor Logs:** Railway → Your Project → Deployments → View Logs
2. **Auto-Deploy:** Every push to GitHub main branch auto-deploys
3. **Free Tier:** $5 credit/month (usually enough for testing)
4. **Custom Domain:** Railway provides free `.railway.app` domain
5. **Environment:** Railway automatically sets `NODE_ENV=production`

---

## 📞 Need Help?

Check Railway docs: https://docs.railway.app

**Common Issues:**
- Deployment fails → Check logs
- API not responding → Check environment variables
- CORS errors → Verify FRONTEND_ORIGIN

---

## 🎉 You're Done!

Your backend is now live on Railway! 

**Next Steps:**
1. Test all your API endpoints
2. Update frontend to use new URL
3. Share the backend URL with your frontend developer (if different person)


