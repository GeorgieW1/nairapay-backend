# 🚀 cPanel Deployment Guide for NairaPay Backend

## Prerequisites
- ✅ cPanel account with Node.js support (Node.js 18+ recommended)
- ✅ MongoDB database (MongoDB Atlas or cPanel MongoDB)
- ✅ Domain or subdomain configured (e.g., `api.yourdomain.com`)
- ✅ All API credentials ready (VTpass, Paystack, etc.)

---

## 📋 Step-by-Step Deployment Process

### **Step 1: Prepare Your Files**

#### 1.1 Create a Production-Ready Package
Before uploading, make sure your backend is ready:

```bash
# Remove test files and unnecessary files
# Keep only production files
```

**Files to EXCLUDE when uploading:**
- `node_modules/` (will install on server)
- `.env` (will create on server)
- Test files: `test-*.js`, `*-diagnostic.js`
- `output.txt`, `*.log`, `*.txt` result files
- `.railway-trigger`

**Files to INCLUDE:**
- All `.js` files (except test files)
- `package.json` and `package-lock.json`
- All folders: `api/`, `config/`, `controllers/`, `middleware/`, `models/`, `public/`, `routes/`, `scripts/`, `services/`, `utils/`, `validators/`, `views/`
- `.env.example` (as reference)
- `README.md` and documentation files

#### 1.2 Create a ZIP Archive
1. Select all necessary files and folders
2. Right-click → Send to → Compressed (zipped) folder
3. Name it: `nairapay-backend.zip`

---

### **Step 2: Upload to cPanel**

#### 2.1 Login to cPanel
1. Go to your cPanel URL (usually `yourdomain.com/cpanel` or `yourdomain.com:2083`)
2. Enter your username and password

#### 2.2 Upload Your Files via File Manager
1. **Open File Manager**
   - In cPanel, find and click **File Manager**
   
2. **Navigate to Your Domain Directory**
   - If deploying to main domain: go to `public_html/`
   - If deploying to subdomain (recommended): go to subdomain folder (e.g., `public_html/api/`)
   
3. **Create Application Directory** (if not exists)
   ```
   public_html/
   └── api/  (or your preferred folder name)
   ```

4. **Upload the ZIP File**
   - Click **Upload** button
   - Select your `nairapay-backend.zip`
   - Wait for upload to complete
   
5. **Extract the ZIP File**
   - Right-click on `nairapay-backend.zip`
   - Click **Extract**
   - Extract to current directory
   - Delete the ZIP file after extraction

---

### **Step 3: Setup Node.js Application**

#### 3.1 Access Setup Node.js App
1. In cPanel, find **Setup Node.js App** (or **Node.js Selector**)
2. Click on it

#### 3.2 Create New Application
Click **Create Application** and configure:

| Field | Value |
|-------|-------|
| **Node.js version** | 18.x or higher (recommended) |
| **Application mode** | Production |
| **Application root** | `api` (or your folder path) |
| **Application URL** | Your subdomain or domain |
| **Application startup file** | `server.js` |
| **Passenger log file** | Leave default |

Click **Create**

---

### **Step 4: Install Dependencies**

#### 4.1 Enter Virtual Environment
After creating the app, cPanel will show you commands. Copy the command that looks like:
```bash
source /home/username/nodevenv/api/18/bin/activate && cd /home/username/api
```

#### 4.2 Open Terminal
1. In cPanel, find **Terminal** icon
2. Click to open terminal

#### 4.3 Run Commands
```bash
# Enter your application directory
cd ~/public_html/api  # Adjust path if needed

# Enter virtual environment (use the command from Node.js App setup)
source /home/username/nodevenv/api/18/bin/activate

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

---

### **Step 5: Configure Environment Variables**

#### 5.1 Create .env File via File Manager
1. Go back to **File Manager**
2. Navigate to your application directory (`public_html/api/`)
3. Click **+ File** button
4. Name it: `.env`
5. Right-click `.env` → **Edit**

#### 5.2 Add Your Environment Variables
```env
# ==============================================
# 🔐 Core Configuration
# ==============================================
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here-change-this

# ==============================================
# 🗄️ Database Configuration
# ==============================================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nairapay?retryWrites=true&w=majority

# ==============================================
# 🌐 Frontend Configuration
# ==============================================
FRONTEND_ORIGIN=https://yourdomain.com
# Or for development: http://localhost:3000
# For multiple origins, update CORS in server.js

# ==============================================
# 💳 Paystack Configuration
# ==============================================
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
# Get from: https://dashboard.paystack.com/#/settings/developer

# ==============================================
# 📱 VTpass Configuration
# ==============================================
# IMPORTANT: Use your LIVE credentials, not sandbox!
VTPASS_API_KEY=your-vtpass-api-key
VTPASS_PUBLIC_KEY=your-vtpass-public-key
VTPASS_SECRET_KEY=your-vtpass-secret-key
VTPASS_MODE=live
# Get from: https://vtpass.com/documentation/

# ==============================================
# 📧 Email Configuration (SMTP)
# ==============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=admin@yourdomain.com

# How to get Gmail App Password:
# 1. Enable 2FA on your Gmail account
# 2. Go to https://myaccount.google.com/apppasswords
# 3. Select "Mail" and "Other (Custom name)"
# 4. Generate and copy the 16-character password

# ==============================================
# 🔥 Firebase Admin SDK (Push Notifications)
# ==============================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Get from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
```

**IMPORTANT Security Notes:**
- ✅ Use **LIVE** credentials for production (not sandbox/test)
- ✅ Keep `.env` file secret - NEVER commit to Git
- ✅ Use strong JWT_SECRET (32+ random characters)
- ✅ Verify VTpass credentials are working (after downtime is resolved)

#### 5.3 Save the File
- Click **Save Changes**
- Verify file permissions are `644` or `600` (right-click → Permissions)

---

### **Step 6: Setup MongoDB Database**

You have two options:

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (if you don't have one)
3. Get your connection string
4. Whitelist cPanel server IP:
   - In Atlas: Network Access → Add IP Address
   - Add your cPanel server IP (find it in cPanel → Server Information)
   - Or allow from anywhere: `0.0.0.0/0` (less secure but easier)
5. Update `MONGO_URI` in `.env` with your Atlas connection string

#### Option B: cPanel MongoDB (If Available)
1. In cPanel, find **MongoDB**
2. Create a new database
3. Create a database user and assign to database
4. Get connection string
5. Update `MONGO_URI` in `.env`

---

### **Step 7: Configure Domain/Subdomain**

#### 7.1 Create Subdomain (Recommended)
1. In cPanel, go to **Subdomains**
2. Create subdomain: `api.yourdomain.com`
3. Set Document Root to your app folder: `public_html/api`
4. Click **Create**

#### 7.2 SSL Certificate (HTTPS)
1. In cPanel, go to **SSL/TLS Status**
2. Find your domain/subdomain
3. Click **Run AutoSSL** to get free Let's Encrypt certificate
4. Wait for installation to complete

---

### **Step 8: Configure .htaccess for Node.js**

#### 8.1 Create/Edit .htaccess File
1. In File Manager, navigate to your app directory
2. Create `.htaccess` file (if not exists)
3. Add this content:

```apache
# Passenger configuration
PassengerAppRoot "/home/username/public_html/api"
PassengerBaseURI "/"
PassengerNodejs "/home/username/nodevenv/api/18/bin/node"

# Enable Passenger
PassengerEnabled on

# Disable directory listings
Options -Indexes

# Protect .env file
<Files .env>
    Order allow,deny
    Deny from all
</Files>

# Protect sensitive files
<FilesMatch "^(package\.json|package-lock\.json|\.git)">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**Important:** Replace `/home/username/` with your actual cPanel username path!

---

### **Step 9: Start/Restart Application**

#### 9.1 Via Node.js App Interface
1. Go back to **Setup Node.js App** in cPanel
2. Find your application
3. Click **Restart** button

#### 9.2 Via Terminal (Alternative)
```bash
# Navigate to app directory
cd ~/public_html/api

# Restart using touch command
touch tmp/restart.txt

# Or restart Passenger
passenger-config restart-app ~/public_html/api
```

---

### **Step 10: Test Your Deployment**

#### 10.1 Health Check
Open your browser and visit:
```
https://api.yourdomain.com/healthz
```

Expected response:
```json
{
  "status": "ok"
}
```

#### 10.2 Check Admin Panel
Visit:
```
https://api.yourdomain.com/admin
```

You should see the login page.

#### 10.3 Check API Endpoints
Test a few endpoints:
```
GET  https://api.yourdomain.com/api/services/data-providers
GET  https://api.yourdomain.com/api/services/tv-providers
```

#### 10.4 View Logs
In cPanel **Setup Node.js App**:
- Click on your application
- Scroll down to see **Application Logs**
- Check for any errors

---

### **Step 11: Setup Initial Admin Account**

#### 11.1 Via Terminal
```bash
# Navigate to app directory
cd ~/public_html/api

# Enter virtual environment
source /home/username/nodevenv/api/18/bin/activate

# Run password reset script
npm run reset:password
```

Follow the prompts to create/reset admin password.

#### 11.2 Login to Admin Panel
1. Visit: `https://api.yourdomain.com/admin`
2. Login with your admin credentials
3. Setup VTpass credentials from dashboard

---

## 🔧 Common Issues & Solutions

### Issue 1: Application Not Starting
**Solution:**
```bash
# Check logs
tail -f ~/logs/api_error.log

# Verify Node.js version
node --version

# Reinstall dependencies
cd ~/public_html/api
npm clean-install
```

### Issue 2: MongoDB Connection Failed
**Symptoms:** "MongoNetworkError" or "ECONNREFUSED"

**Solutions:**
- ✅ Verify `MONGO_URI` in `.env` is correct
- ✅ Check MongoDB Atlas IP whitelist includes your server IP
- ✅ Test connection string from terminal:
```bash
mongo "your-connection-string"
```

### Issue 3: 502 Bad Gateway
**Symptoms:** Nginx 502 error

**Solutions:**
- ✅ Check if app is running: `passenger-status`
- ✅ Restart application: `touch tmp/restart.txt`
- ✅ Check port in `.env` matches cPanel configuration
- ✅ Review error logs in cPanel

### Issue 4: Environment Variables Not Loading
**Symptoms:** Undefined values, missing credentials

**Solutions:**
- ✅ Verify `.env` file exists in correct directory
- ✅ Check file permissions: `ls -la | grep .env`
- ✅ Restart application after changing `.env`
- ✅ No extra spaces in `.env` file

### Issue 5: CORS Errors from Frontend
**Symptoms:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solutions:**
- ✅ Update `FRONTEND_ORIGIN` in `.env`:
```env
FRONTEND_ORIGIN=https://yourdomain.com
```
- ✅ For multiple origins, edit `server.js`:
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:3000' // For development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Issue 6: File Upload/Permissions Issues
**Solution:**
```bash
# Set correct ownership
chown -R username:username ~/public_html/api

# Set correct permissions
find ~/public_html/api -type f -exec chmod 644 {} \;
find ~/public_html/api -type d -exec chmod 755 {} \;
chmod 600 ~/public_html/api/.env
```

---

## 📊 Post-Deployment Checklist

- [ ] ✅ Application starts without errors
- [ ] ✅ Health check endpoint responds
- [ ] ✅ MongoDB connection successful
- [ ] ✅ Admin panel accessible
- [ ] ✅ Admin login works
- [ ] ✅ VTpass credentials configured
- [ ] ✅ Paystack credentials configured
- [ ] ✅ SMTP email working (test OTP)
- [ ] ✅ SSL certificate installed (HTTPS)
- [ ] ✅ CORS configured for frontend
- [ ] ✅ All API endpoints responding
- [ ] ✅ Transaction flow working
- [ ] ✅ Logs are being written
- [ ] ✅ Firebase push notifications configured (if using)

---

## 🔄 Updating Your Application

When you need to update your code:

### Method 1: Via File Manager
1. Edit individual files in cPanel File Manager
2. Save changes
3. Restart app: `touch tmp/restart.txt`

### Method 2: Via Git (Recommended if available)
```bash
cd ~/public_html/api
git pull origin main
npm install
touch tmp/restart.txt
```

### Method 3: Re-upload ZIP
1. Create new ZIP with updated files
2. Upload to cPanel
3. Extract (overwrite existing)
4. Run `npm install` if dependencies changed
5. Restart application

---

## 📞 Support & Resources

- **cPanel Documentation:** [https://docs.cpanel.net/](https://docs.cpanel.net/)
- **Node.js on cPanel:** Contact your hosting provider
- **VTpass API Docs:** [https://vtpass.com/documentation/](https://vtpass.com/documentation/)
- **Paystack Docs:** [https://paystack.com/docs](https://paystack.com/docs)
- **MongoDB Atlas:** [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)

---

## 🔐 Security Best Practices

1. ✅ **Never expose `.env` file** - Protected by `.htaccess`
2. ✅ **Use HTTPS only** - Install SSL certificate
3. ✅ **Strong JWT_SECRET** - Use 32+ random characters
4. ✅ **Keep dependencies updated** - Run `npm audit` regularly
5. ✅ **Monitor logs** - Check for unauthorized access attempts
6. ✅ **Backup database** - Regular MongoDB backups
7. ✅ **Rate limiting** - Already configured in server.js
8. ✅ **Use production API keys** - Not test/sandbox keys

---

## 🎉 Congratulations!

Your NairaPay backend is now deployed on cPanel! 

**Next Steps:**
1. Test all functionalities thoroughly
2. Configure your Flutter app to use the new API URL
3. Monitor logs for any errors
4. Set up automated backups
5. Configure domain email forwarding for SMTP

**Need help?** Check the logs first, then refer to the troubleshooting section above.
