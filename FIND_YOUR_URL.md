# 🔍 How to Find Your Railway Backend URL

## ✅ Step 1: Get Your Backend URL

In Railway Dashboard:

1. Click on your **project** name (top left)
2. Click **"Settings"** tab (not Deployments)
3. Scroll down to **"Domains"** section
4. You should see:
   - Either a domain already generated (like `nairapay-backend-production.up.railway.app`)
   - Or a button **"Generate Domain"** - click it!

5. **Copy the URL** - this is your backend base URL!

---

## 🌐 Your API Endpoints

Once you have your URL (let's say it's `https://nairapay-backend-production.up.railway.app`), here are your endpoints:

### Base URL:
```
https://your-app-name.railway.app
```

### Authentication Endpoints:
- Login: `POST https://your-app-name.railway.app/api/auth/login`
- Register: `POST https://your-app-name.railway.app/api/auth/register`
- Verify Token: `POST https://your-app-name.railway.app/api/auth/verify-token`
- Forgot Password: `POST https://your-app-name.railway.app/api/auth/forgot-password`
- Reset Password: `POST https://your-app-name.railway.app/api/auth/reset-password`

### Admin Endpoints (Need Admin Token):
- Get Users: `GET https://your-app-name.railway.app/api/admin/users`
- Get Integrations: `GET https://your-app-name.railway.app/api/admin/integrations`
- Add Integration: `POST https://your-app-name.railway.app/api/admin/integrations`
- Get API Keys: `GET https://your-app-name.railway.app/api/admin/api-keys`
- Add API Key: `POST https://your-app-name.railway.app/api/admin/api-keys`

### Health Check:
- Health: `GET https://your-app-name.railway.app/healthz`

### Admin Dashboard:
- Admin Login: `GET https://your-app-name.railway.app/admin`
- Admin Dashboard: `GET https://your-app-name.railway.app/admin/dashboard`

---

## 🧪 Test Your API

### 1. Test Health Endpoint:
Open in browser:
```
https://your-app-name.railway.app/healthz
```
Should return: `{"status":"ok"}`

### 2. Test Login Endpoint:
Use Postman or curl:
```bash
curl -X POST https://your-app-name.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### 3. Test Admin Dashboard:
Open in browser:
```
https://your-app-name.railway.app/admin
```
Should show login page

---

## 📍 Where to Find URL in Railway:

**Navigation Path:**
```
Railway Dashboard → Your Project → Settings → Domains
```

Look for:
- **Custom Domain** section (if you have one)
- **Railway Domain** section (this is your free domain!)

---

## 💡 Quick Visual Guide:

1. **Top Left:** Click project name
2. **Tabs:** Click **"Settings"** (3rd tab usually)
3. **Scroll Down:** Find **"Domains"** section
4. **See URL:** Copy the domain (e.g., `nairapay-backend-production.up.railway.app`)
5. **Use it:** Add `https://` at the beginning!

---

## 🎯 Example:

If Railway shows:
```
nairapay-backend-production.up.railway.app
```

Your full base URL is:
```
https://nairapay-backend-production.up.railway.app
```

Your login endpoint:
```
https://nairapay-backend-production.up.railway.app/api/auth/login
```

---

## ✅ Next Steps:

1. Get your URL from Settings → Domains
2. Test `/healthz` endpoint
3. Update your frontend to use this URL
4. Test login endpoint
5. Access admin dashboard at `/admin`


