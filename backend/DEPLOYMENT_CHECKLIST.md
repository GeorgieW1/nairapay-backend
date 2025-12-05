# 📋 cPanel Deployment Quick Checklist

## Before Upload
- [ ] All code tested and working locally
- [ ] VTpass credentials verified (after downtime resolved)
- [ ] Paystack credentials ready
- [ ] MongoDB Atlas cluster created
- [ ] Email SMTP credentials ready
- [ ] Firebase credentials ready (if using push notifications)

## Files to Prepare
- [ ] Remove `node_modules/` folder
- [ ] Remove test files (test-*.js)
- [ ] Remove diagnostic files (*-diagnostic.js)
- [ ] Remove log files (*.log, *.txt)
- [ ] Keep `.env.example` as reference
- [ ] Create ZIP of remaining files

## Files to INCLUDE in ZIP:
```
✅ server.js
✅ package.json
✅ package-lock.json
✅ .env.example
✅ api/ folder
✅ config/ folder
✅ controllers/ folder
✅ middleware/ folder
✅ models/ folder
✅ public/ folder
✅ routes/ folder
✅ scripts/ folder
✅ services/ folder
✅ utils/ folder
✅ validators/ folder
✅ views/ folder
```

## Files to EXCLUDE from ZIP:
```
❌ node_modules/
❌ .env (will create on server)
❌ .git/
❌ test-*.js
❌ *-diagnostic.js
❌ *.log, *.txt, output.txt
❌ .railway-trigger
```

## cPanel Setup Steps
1. [ ] Login to cPanel
2. [ ] Open File Manager
3. [ ] Navigate to subdomain folder (e.g., public_html/api/)
4. [ ] Upload ZIP file
5. [ ] Extract ZIP file
6. [ ] Setup Node.js App (version 18+)
7. [ ] Open Terminal
8. [ ] Run `npm install`
9. [ ] Create `.env` file with all credentials
10. [ ] Create `.htaccess` file
11. [ ] Restart application
12. [ ] Test health endpoint: /healthz
13. [ ] Setup admin account
14. [ ] Test API endpoints

## Environment Variables to Configure
```env
✅ NODE_ENV=production
✅ PORT=5000
✅ JWT_SECRET=
✅ MONGO_URI=
✅ FRONTEND_ORIGIN=
✅ PAYSTACK_SECRET_KEY=
✅ VTPASS_API_KEY=
✅ VTPASS_PUBLIC_KEY=
✅ VTPASS_SECRET_KEY=
✅ VTPASS_MODE=live
✅ SMTP_HOST=
✅ SMTP_PORT=
✅ SMTP_USER=
✅ SMTP_PASSWORD=
✅ ADMIN_EMAIL=
✅ FIREBASE_PROJECT_ID=
✅ FIREBASE_PRIVATE_KEY=
✅ FIREBASE_CLIENT_EMAIL=
```

## Testing After Deployment
- [ ] Health check: https://api.yourdomain.com/healthz
- [ ] Admin panel: https://api.yourdomain.com/admin
- [ ] Login to admin panel
- [ ] Test API endpoints:
  - [ ] /api/services/data-providers
  - [ ] /api/services/tv-providers
  - [ ] /api/auth/login
- [ ] Check application logs
- [ ] Test transaction flow
- [ ] Verify VTpass connection
- [ ] Verify Paystack connection
- [ ] Test email sending

## SSL Configuration
- [ ] Create/configure subdomain
- [ ] Run AutoSSL in cPanel
- [ ] Verify HTTPS works
- [ ] Force HTTPS redirect (if needed)

## Post-Deployment
- [ ] Update Flutter app API URL
- [ ] Test Flutter app with live backend
- [ ] Monitor logs for errors
- [ ] Setup database backups
- [ ] Document API URL and credentials

## Important Credentials to Have Ready
1. **cPanel Login**
   - URL: _________________
   - Username: _________________
   - Password: _________________

2. **MongoDB Atlas**
   - Connection String: _________________
   - Database Name: nairapay

3. **VTpass (LIVE)**
   - API Key: _________________
   - Public Key: _________________
   - Secret Key: _________________

4. **Paystack (LIVE)**
   - Secret Key: _________________

5. **Email (SMTP)**
   - Email: _________________
   - App Password: _________________

6. **Domain Info**
   - Main Domain: _________________
   - API Subdomain: _________________

## Emergency Contacts
- Hosting Support: _________________
- MongoDB Atlas Support: https://support.mongodb.com
- VTpass Support: support@vtpass.com
- Paystack Support: support@paystack.com
