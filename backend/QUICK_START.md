# 🚀 cPanel Deployment - Quick Start Guide

## ✅ PREPARATION COMPLETE!

Your deployment files are ready in the `cpanel-deployment` folder.

---

## 📦 STEP 1: Create ZIP File

1. Open the `cpanel-deployment` folder (should be open already)
2. Select **ALL** files and folders inside it
3. Right-click → **Send to** → **Compressed (zipped) folder**
4. Name it: `nairapay-backend.zip`

---

## 🌐 STEP 2: Upload to cPanel

### A. Login to cPanel
- URL: Your hosting cPanel URL (usually `yourdomain.com/cpanel`)
- Enter your credentials

### B. Open File Manager
- Find **File Manager** icon in cPanel
- Click to open

### C. Navigate to Directory
- For subdomain deployment (RECOMMENDED):
  - Go to the subdomain folder (e.g., `public_html/api/`)
  - If subdomain doesn't exist, create it first: **Domains** → **Subdomains** → Create `api`
- For main domain:
  - Go to `public_html/`

### D. Upload ZIP
- Click **Upload** button at the top
- Select your `nairapay-backend.zip` file
- Wait for upload to complete (watch the progress bar)
- Go back to File Manager

### E. Extract ZIP
- Find `nairapay-backend.zip` in the file list
- Right-click → **Extract**
- Choose "Extract to current directory"
- Wait for extraction to complete
- **Delete** the ZIP file after extraction

---

## ⚙️ STEP 3: Setup Node.js Application

### A. Open Node.js Setup
- In cPanel main page, search for **"Setup Node.js App"** or **"Node.js Selector"**
- Click to open

### B. Create Application
Click **"Create Application"** and fill in:

| Setting | Value |
|---------|-------|
| Node.js version | **18.x** (or latest available) |
| Application mode | **Production** |
| Application root | Path to your app folder (e.g., `api`) |
| Application URL | Your domain/subdomain (e.g., `api.yourdomain.com`) |
| Application startup file | **server.js** |

Click **CREATE**

### C. Note the Commands
After creation, cPanel will show commands. **COPY** the first command that looks like:
```bash
source /home/YOUR_USERNAME/nodevenv/api/18/bin/activate && cd /home/YOUR_USERNAME/api
```

---

## 💻 STEP 4: Install Dependencies via Terminal

### A. Open Terminal
- In cPanel, find **Terminal** icon
- Click to open

### B. Activate Node Environment
Paste and run the command you copied earlier:
```bash
source /home/YOUR_USERNAME/nodevenv/api/18/bin/activate && cd /home/YOUR_USERNAME/api
```

### C. Install Packages
```bash
npm install
```

Wait for all packages to install (may take a few minutes).

### D. Verify Installation
```bash
npm list --depth=0
```

You should see all your dependencies listed.

---

## 🔐 STEP 5: Configure Environment Variables

### A. Create .env File
- Go back to **File Manager**
- Navigate to your app folder
- Click **+ File** button
- Name it exactly: `.env`
- Right-click on `.env` → **Edit**

### B. Add Your Credentials
Copy this template and **REPLACE** with your actual values:

```env
NODE_ENV=production
PORT=5000

# JWT Secret (generate a strong random string)
JWT_SECRET=change-this-to-a-very-secure-random-string-32chars-minimum

# MongoDB (from MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nairapay?retryWrites=true&w=majority

# Frontend URL
FRONTEND_ORIGIN=https://yourdomain.com

# Paystack (LIVE credentials)
PAYSTACK_SECRET_KEY=sk_live_YOUR_PAYSTACK_SECRET_KEY

# VTpass (LIVE credentials - verify these work after downtime!)
VTPASS_API_KEY=your_vtpass_api_key
VTPASS_PUBLIC_KEY=your_vtpass_public_key
VTPASS_SECRET_KEY=your_vtpass_secret_key
VTPASS_MODE=live

# Email SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Firebase (optional - for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**IMPORTANT:**
- ✅ Use **LIVE** credentials, not sandbox/test
- ✅ No spaces around `=` sign
- ✅ Keep quotes around Firebase private key
- ✅ Verify VTpass credentials are working (wait for their downtime to resolve)

### C. Save the File
- Click **Save Changes**
- Close the editor

---

## 🔧 STEP 6: Update .htaccess File

### A. Open .htaccess
- In File Manager, find `.htaccess` file
- Right-click → **Edit**

### B. Update Username
Replace **ALL occurrences** of `username` with your **actual cPanel username**:

```apache
# Before:
PassengerAppRoot "/home/username/public_html/api"

# After (example):
PassengerAppRoot "/home/johndoe/public_html/api"
```

### C. Verify Paths
Make sure all paths match your setup:
- If your app is in `public_html/api/`, keep as is
- If different, adjust paths accordingly

### D. Save the File

---

## 🔄 STEP 7: Restart Application

### Method 1: Via Node.js App Interface
- Go back to **Setup Node.js App**
- Find your application in the list
- Click **Restart** button
- Wait for "Restarted successfully" message

### Method 2: Via Terminal (Alternative)
```bash
cd ~/public_html/api
touch tmp/restart.txt
```

---

## ✅ STEP 8: Test Your Deployment

### A. Health Check
Open your browser and visit:
```
https://api.yourdomain.com/healthz
```

**Expected response:**
```json
{"status":"ok"}
```

### B. Admin Panel
Visit:
```
https://api.yourdomain.com/admin
```

You should see the login page.

### C. API Endpoints
Test these:
```
https://api.yourdomain.com/api/services/data-providers
https://api.yourdomain.com/api/services/tv-providers
```

### D. Check Logs
- In **Setup Node.js App**, click on your app
- Scroll to **Application Logs**
- Check for any errors

**If you see errors:**
1. Check `.env` file has all required variables
2. Verify MongoDB connection string
3. Check file permissions
4. Review logs for specific error messages

---

## 🔑 STEP 9: Setup Admin Account

### Via Terminal:
```bash
cd ~/public_html/api
source /home/YOUR_USERNAME/nodevenv/api/18/bin/activate
npm run reset:password
```

Follow the prompts to create/reset your admin password.

---

## 🎉 SUCCESS CHECKLIST

- [ ] ✅ Health check returns {"status":"ok"}
- [ ] ✅ Admin panel loads
- [ ] ✅ Can login to admin panel
- [ ] ✅ MongoDB connected (check logs)
- [ ] ✅ No errors in application logs
- [ ] ✅ API endpoints responding

---

## 🚨 TROUBLESHOOTING

### Issue: "502 Bad Gateway"
**Fix:**
1. Check if app is running: In Node.js App, verify status is "Running"
2. Restart the application
3. Check application logs for errors
4. Verify .env file exists and has all variables

### Issue: "Cannot connect to MongoDB"
**Fix:**
1. Verify `MONGO_URI` in `.env` is correct
2. In MongoDB Atlas:
   - Go to **Network Access**
   - Add your cPanel server IP
   - Or allow from anywhere: `0.0.0.0/0`
3. Test connection string format
4. Restart application

### Issue: "Environment variables not loading"
**Fix:**
1. Check `.env` file exists in app root directory
2. Verify no extra spaces in `.env` file
3. Ensure no BOM (byte order mark) in file
4. Restart application after any `.env` changes

### Issue: "CORS errors from frontend"
**Fix:**
1. Update `FRONTEND_ORIGIN` in `.env`:
   ```env
   FRONTEND_ORIGIN=https://yourdomain.com
   ```
2. Restart application
3. If multiple origins needed, update `server.js` CORS configuration

---

## 📚 Additional Resources

- **Full Guide:** See `CPANEL_DEPLOYMENT_GUIDE.md` for detailed instructions
- **Checklist:** See `DEPLOYMENT_CHECKLIST.md` for comprehensive checklist
- **MongoDB Atlas:** https://cloud.mongodb.com
- **VTpass Docs:** https://vtpass.com/documentation/
- **Paystack Docs:** https://paystack.com/docs

---

## 🔒 IMPORTANT SECURITY REMINDERS

1. ✅ **NEVER** commit `.env` file to Git
2. ✅ Use **LIVE** API credentials, not test/sandbox
3. ✅ Keep cPanel credentials secure
4. ✅ Use strong passwords for everything
5. ✅ Enable SSL certificate (HTTPS)
6. ✅ Regularly backup your database
7. ✅ Monitor application logs

---

## 📞 Need Help?

- Check application logs first
- Review the full deployment guide
- Contact your hosting support for cPanel-specific issues
- Check MongoDB Atlas status
- Verify VTpass service status (if issues with VTpass)

---

## 🎯 After Deployment

1. **Update Flutter App**
   - Change API base URL to: `https://api.yourdomain.com`
   - Test all features with live backend

2. **Configure VTpass**
   - Login to admin panel
   - Navigate to API Keys section
   - Verify VTpass credentials are set
   - Test a transaction

3. **Monitor**
   - Check logs daily for first week
   - Monitor transaction success rates
   - Set up database backups

4. **SSL Certificate**
   - In cPanel → SSL/TLS Status
   - Run AutoSSL for your subdomain
   - Verify HTTPS works

---

**Good luck with your deployment! 🚀**

If you encounter any issues, refer to the troubleshooting section above or the full deployment guide.
