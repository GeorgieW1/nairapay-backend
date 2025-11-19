# 🚀 Production Deployment Checklist

Complete checklist for deploying NairaPay backend with live credentials.

## 📋 Pre-Deployment Checklist

### 1. ✅ Credentials Prepared
- [ ] VTPass API Key: `b8bed9a093539a61f851a69ac53cb45e`
- [ ] Paystack Public Key: `PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548`
- [ ] Paystack Secret Key: `SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221`
- [ ] MongoDB connection string ready
- [ ] JWT secret key ready

### 2. ✅ Environment Setup
- [ ] Railway/Render account active
- [ ] MongoDB Atlas cluster running
- [ ] Domain configured (if applicable)
- [ ] SSL certificate ready (automatic on Railway/Render)

---

## 🔧 Step-by-Step Deployment

### Step 1: Setup VTPass Integrations

#### Option A: Automated (Recommended)
```bash
cd backend
node scripts/addLiveCredentials.js
```

#### Option B: Manual via Admin Dashboard
1. Login: https://your-domain.com/admin
2. Navigate to Integrations
3. Delete old sandbox integrations
4. Add 4 new live integrations:
   - Airtime (VTpass, live mode)
   - Data (VTpass, live mode)
   - Electricity (VTpass, live mode)
   - TV (VTpass, live mode)

**Verification**: Check admin dashboard shows all 4 integrations with "live" mode.

---

### Step 2: Configure Environment Variables

#### Railway:
1. Go to: https://railway.app/project/your-project
2. Click **"Variables"** tab
3. Add/Update these variables:

```env
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
FRONTEND_ORIGIN=<your-frontend-url>
PAYSTACK_PUBLIC_KEY=PK_394bdd37d05020ef6b1c8b82be5af1e70b5768b5548
PAYSTACK_SECRET_KEY=SK_98879d3e8ffab5f682a973c61bb2b8eb064f7513221
```

4. Railway auto-redeploys
5. Wait for deployment to complete (check logs)

#### Render:
1. Go to service dashboard
2. Click **"Environment"** tab
3. Add same variables as above
4. Click **"Save Changes"**
5. Manually trigger redeploy

**Verification**: Check deployment logs for successful startup.

---

### Step 3: Database Configuration

#### MongoDB Atlas:
1. **Whitelist IP Addresses**:
   - Go to Network Access
   - Add Railway/Render IP ranges
   - Or allow access from anywhere (0.0.0.0/0) for testing

2. **Create Database User**:
   - Username: nairapay_admin
   - Password: Strong password
   - Role: readWrite on nairapay database

3. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nairapay?retryWrites=true&w=majority
   ```

**Verification**: Test connection from Railway/Render logs.

---

### Step 4: Test Production Deployment

#### 4.1 Health Check
```bash
curl https://your-domain.com/healthz
```
Expected: `{"status":"ok"}`

#### 4.2 Admin Login
1. Visit: https://your-domain.com/admin
2. Login with admin credentials
3. Verify dashboard loads

#### 4.3 Check Integrations
1. Navigate to Integrations tab
2. Verify all 4 VTpass integrations exist
3. Check mode is "live"
4. Verify credentials are masked

#### 4.4 Check Environment Config
```bash
curl https://your-domain.com/api/health/config
```
Should show all required configs loaded.

---

## 🧪 Production Testing

### Test 1: User Registration
```bash
POST https://your-domain.com/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "phone": "08012345678"
}
```

### Test 2: Wallet Funding (Paystack)
```bash
POST https://your-domain.com/api/wallet/paystack/initialize
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "amount": 1000
}
```

Expected: Returns Paystack payment URL

### Test 3: Airtime Purchase (VTpass)
```bash
POST https://your-domain.com/api/services/airtime
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "phone": "08012345678",
  "network": "MTN",
  "amount": 50
}
```

Expected: 
- Status: 200
- Transaction status: "completed"
- Wallet balance deducted

### Test 4: Data Purchase
```bash
POST https://your-domain.com/api/services/data
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "phone": "08012345678",
  "network": "MTN",
  "plan": "1GB",
  "amount": 300
}
```

### Test 5: Transaction History
```bash
GET https://your-domain.com/api/transactions
Authorization: Bearer <user-token>
```

Expected: Returns list of transactions

---

## 🔒 Security Verification

### Checklist:
- [ ] All API endpoints require authentication
- [ ] Admin routes verify admin role
- [ ] Environment variables not exposed in responses
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Helmet security headers enabled
- [ ] Sensitive data masked in logs
- [ ] .env file not committed to Git

### Test Security:
```bash
# Try accessing protected route without token
curl https://your-domain.com/api/services/airtime
# Expected: 401 Unauthorized

# Try admin route with user token
curl https://your-domain.com/api/admin/users \
  -H "Authorization: Bearer <user-token>"
# Expected: 403 Forbidden
```

---

## 📊 Monitoring Setup

### Railway:
1. Enable metrics in dashboard
2. Set up alerts for:
   - Service downtime
   - High error rates
   - Memory usage > 80%

### Render:
1. Check deployment logs regularly
2. Monitor response times
3. Track error rates

### MongoDB Atlas:
1. Enable monitoring
2. Set alerts for:
   - High connection count
   - Storage usage
   - Query performance

---

## 🆘 Rollback Plan

If something goes wrong:

### Immediate Actions:
1. **Check logs**:
   ```bash
   railway logs  # or check Render dashboard
   ```

2. **Verify environment variables**:
   - Double-check all variables are set
   - Ensure no typos in keys

3. **Rollback VTpass integrations**:
   ```bash
   # Delete live integrations via admin dashboard
   # Re-run setup script if needed
   ```

4. **Revert to previous deployment**:
   - Railway: Click previous deployment
   - Render: Redeploy from previous commit

### Emergency Contact:
- VTpass Support: support@vtpass.com
- Paystack Support: support@paystack.com
- MongoDB Atlas: Cloud console

---

## ✅ Post-Deployment Verification

### Day 1:
- [ ] Monitor first transactions
- [ ] Check error logs
- [ ] Verify webhook deliveries
- [ ] Test all service types

### Week 1:
- [ ] Review transaction success rates
- [ ] Monitor API response times
- [ ] Check user feedback
- [ ] Verify payment settlements

### Week 2:
- [ ] Analyze transaction patterns
- [ ] Optimize slow queries
- [ ] Review security logs
- [ ] Update documentation if needed

---

## 📈 Success Metrics

Track these metrics:

| Metric | Target | Current |
|--------|--------|---------|
| Transaction Success Rate | > 95% | ___ |
| API Response Time | < 2s | ___ |
| Uptime | > 99.5% | ___ |
| Error Rate | < 1% | ___ |
| User Registrations | ___ | ___ |
| Total Transaction Volume | ___ | ___ |

---

## 🎯 Final Checklist

Before going live:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] VTpass integrations active (live mode)
- [ ] Paystack keys configured
- [ ] Database connected and accessible
- [ ] Admin dashboard accessible
- [ ] Security measures verified
- [ ] Monitoring enabled
- [ ] Rollback plan documented
- [ ] Support contacts saved
- [ ] Team notified of deployment
- [ ] Documentation updated

---

## 🚀 You're Live!

Once all checks pass:
1. ✅ Backend is production-ready
2. ✅ All services configured
3. ✅ Security measures active
4. ✅ Monitoring in place

**Next Steps**:
1. Monitor first transactions closely
2. Be ready to respond to issues
3. Collect user feedback
4. Plan iterative improvements

---

## 📞 Emergency Contacts

**Hosting Issues**:
- Railway: https://railway.app/help
- Render: support@render.com

**Payment Issues**:
- VTpass: support@vtpass.com
- Paystack: support@paystack.com

**Database Issues**:
- MongoDB Atlas: Cloud console support

**System Administrator**:
- Monitor admin email for alerts
- Check dashboard regularly

---

**Deployment Date**: __________
**Deployed By**: __________
**Production URL**: __________

✅ **PRODUCTION DEPLOYMENT COMPLETE** ✅
