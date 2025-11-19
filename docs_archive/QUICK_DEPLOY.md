# 🚀 Quick Deployment Guide - NairaPay Backend

## ⚡ Recommended: Railway (Easiest for Express + MongoDB)

**Why Railway?**
- ✅ One-click deployment from GitHub
- ✅ Free tier ($5 credit/month)
- ✅ Automatic HTTPS
- ✅ Easy MongoDB Atlas integration
- ✅ Perfect for Express apps

### Steps:
1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

3. **Set Environment Variables**
   Click on your project → Variables tab → Add:
   
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nairapay
   JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
   FRONTEND_ORIGIN=https://your-frontend.vercel.app
   PORT=5000
   ```
   
   (Firebase vars optional if using Firebase)

4. **Get Your Backend URL**
   - Railway gives you: `https://your-app.railway.app`
   - This is your API base URL!

5. **Update Frontend**
   - Your frontend should use: `https://your-app.railway.app/api/...`
   - The code already auto-detects the origin, but you can hardcode if needed

---

## 🔧 Alternative: Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `backend`
5. Add environment variables (same as Railway)
6. Deploy!

---

## 📦 Your API Endpoints (After Deployment)

**Base URL:** `https://your-app.railway.app`

### Authentication
- `POST https://your-app.railway.app/api/auth/login`
- `POST https://your-app.railway.app/api/auth/register`
- `POST https://your-app.railway.app/api/auth/verify-token`
- `POST https://your-app.railway.app/api/auth/forgot-password`
- `POST https://your-app.railway.app/api/auth/reset-password`

### Admin
- `GET https://your-app.railway.app/api/admin/users`
- `GET https://your-app.railway.app/api/admin/integrations`
- `POST https://your-app.railway.app/api/admin/integrations`

### Health Check
- `GET https://your-app.railway.app/healthz`

---

## 🎯 Next Steps

1. ✅ Deploy backend (Railway recommended)
2. ✅ Get your backend URL
3. ✅ Update frontend to use backend URL
4. ✅ Set `FRONTEND_ORIGIN` in backend env vars
5. ✅ Test API endpoints
6. ✅ Deploy frontend

---

## 📝 Environment Variables Checklist

Before deploying, make sure you have:

- [x] `MONGO_URI` - MongoDB connection string
- [x] `JWT_SECRET` - Strong random secret (32+ chars)
- [x] `FRONTEND_ORIGIN` - Your frontend URL
- [ ] `FIREBASE_PROJECT_ID` (if using Firebase)
- [ ] `FIREBASE_CLIENT_EMAIL` (if using Firebase)
- [ ] `FIREBASE_PRIVATE_KEY` (if using Firebase)

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Check `MONGO_URI` format
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify username/password are correct

**"CORS errors"**
- Set `FRONTEND_ORIGIN` to your frontend URL (no trailing slash)
- Check browser console for specific error

**"401 Unauthorized"**
- Verify `JWT_SECRET` is set
- Check token is being sent in Authorization header

---

## 💡 Pro Tips

1. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Test Health Endpoint:**
   ```bash
   curl https://your-app.railway.app/healthz
   ```

3. **Monitor Logs:**
   - Railway: Project → Deployments → View Logs
   - Render: Dashboard → Service → Logs

