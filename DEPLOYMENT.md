# NairaPay Backend - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Vercel (Serverless Functions)
Vercel works well for serverless deployments, but has limitations for long-running processes.

### Option 2: Railway (Recommended for Express + MongoDB)
✅ Best for Express apps with MongoDB
✅ Easy setup
✅ Automatic deployments from GitHub
✅ Free tier available

**Deploy to Railway:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (see below)
6. Deploy!

### Option 3: Render
✅ Good for Express apps
✅ Free tier available
✅ Easy setup

### Option 4: Fly.io
✅ Good global performance
✅ Free tier available

---

## 📋 Environment Variables

You'll need to set these in your deployment platform:

### Required Variables:
```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nairapay
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

### Optional (Firebase):
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Port (usually auto-set):
```bash
PORT=5000  # Most platforms set this automatically
```

---

## 🔧 Setup Steps

### 1. Update Frontend API URLs

After deployment, update your frontend to use the deployed backend URL.

**In `backend/public/index.js` (line 4):**
```javascript
const API_BASE = process.env.VITE_API_URL || "https://your-backend.railway.app";
```

**In `backend/public/dashboard.js`:**
The dashboard uses relative URLs (`/api/...`) which should work automatically.

### 2. Set CORS in Backend

Update `backend/server.js` line 42:
```javascript
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
```

Set `FRONTEND_ORIGIN` to your frontend URL in production.

### 3. MongoDB Setup

1. Create a MongoDB Atlas account (free tier available)
2. Create a cluster
3. Get your connection string
4. Add to environment variables as `MONGO_URI`

### 4. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 API Endpoints (After Deployment)

Once deployed, your API will be available at:

**Base URL:** `https://your-backend-url.com`

### Authentication:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/firebase-login` - Firebase login
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Admin:
- `GET /api/admin/users` - Get all users
- `GET /api/admin/api-keys` - Get all API keys
- `POST /api/admin/api-keys` - Add API key
- `DELETE /api/admin/api-keys/:id` - Delete API key
- `GET /api/admin/integrations` - Get all integrations
- `POST /api/admin/integrations` - Add integration
- `DELETE /api/admin/integrations/:id` - Delete integration

### API Keys:
- `GET /api/api-keys` - Get keys (admin only)
- `POST /api/api-keys` - Create key (admin only)
- `PUT /api/api-keys/:id` - Update key (admin only)
- `DELETE /api/api-keys/:id` - Delete key (admin only)

### VTPass:
- `POST /api/vtpass/*` - VTPass integration routes

---

## 📝 Deployment Checklist

- [ ] Set all environment variables
- [ ] Update `FRONTEND_ORIGIN` in environment
- [ ] Update frontend API URL
- [ ] Test `/healthz` endpoint
- [ ] Test authentication endpoints
- [ ] Verify CORS is working
- [ ] Test admin dashboard login

---

## 🔍 Troubleshooting

### MongoDB Connection Issues
- Check `MONGO_URI` format
- Ensure IP whitelist includes `0.0.0.0/0` for testing
- Verify username/password are correct

### CORS Errors
- Set `FRONTEND_ORIGIN` correctly
- Check browser console for specific errors

### 401 Unauthorized
- Verify `JWT_SECRET` is set
- Check token expiration

---

## 📞 Need Help?

Check your deployment platform's logs for detailed error messages.


