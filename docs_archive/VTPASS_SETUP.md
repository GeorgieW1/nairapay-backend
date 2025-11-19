# 🔌 VTpass Integration Setup Guide

## 🎯 What You Need to Do

**Currently:** Your service endpoints are **simulating** VTpass responses (not actually calling VTpass)

**To Make It Work:** You need to:
1. Get VTpass sandbox API keys
2. Add VTpass integration in your admin dashboard
3. The code will then call **real VTpass API**

---

## 📋 Step 1: Get VTpass Sandbox Credentials

### 1. Sign Up for VTpass Sandbox:
1. Go to **https://www.vtpass.com**
2. Click **"Sign Up"** or **"Register"**
3. Create a **Sandbox Account** (free for testing)
4. Log in to your sandbox account

### 2. Get Your API Keys:
1. Go to your **Profile** → **API Keys** tab
2. Copy these three keys:
   - **Static API Key** (looks like: `your-api-key`)
   - **Public Key** (looks like: `public_xxxxxxxx`)
   - **Secret Key** (looks like: `secret_xxxxxxxx`) 
3. ⚠️ **Important:** Public and Secret keys are shown **only once** - copy them immediately!

---

## 🎛️ Step 2: Add VTpass Integration in Admin Dashboard

### Using Your Admin Dashboard:

1. Login to admin: `https://nairapay-backend-production.up.railway.app/admin`
2. Click **"Integrations"** in sidebar
3. Fill in the form:

**Provider Name:** `VTpass`

**Category:** `airtime` (or create one for each service)

**Base URL:** `https://sandbox.vtpass.com/api` (for sandbox testing)
- **Live URL:** `https://vtpass.com/api` (when going live)

**Mode:** `sandbox` (for testing)

**Credentials:**
Click **"+ Add Field"** and add these three:

**Field 1:**
- Label: `Static API Key`
- Value: `your-api-key-from-vtpass`

**Field 2:**
- Label: `Public Key`
- Value: `public_xxxxxxxx-from-vtpass`

**Field 3:**
- Label: `Secret Key`
- Value: `secret_xxxxxxxx-from-vtpass`

4. Click **"Save Integration"**

**You should add separate integrations for:**
- Airtime (category: `airtime`)
- Data (category: `data`)
- Electricity (category: `electricity`)

---

## 🔧 Step 3: How It Works

### How to Test VTpass Connection:

**Test Endpoint (Admin Only):**
```bash
POST /api/vtpass/airtime/test
Headers: { "Authorization": "Bearer <admin-token>" }
```

This will call VTpass sandbox API and show you the response!

---

## 📝 VTpass API Endpoints

Based on VTpass documentation:

### Airtime Purchase:
```javascript
POST https://sandbox.vtpass.com/api/pay
Headers:
  api-key: your-api-key
  public-key: your-public-key
Body:
{
  "request_id": "unique-request-id",
  "serviceID": "mtn", // mtn, airtel, glo, 9mobile
  "amount": "100",
  "phone": "08111111111"
}
```

### Data Purchase:
```javascript
POST https://sandbox.vtpass.com/api/pay
Headers:
  api-key: your-api-key
  public-key: your-public-key
Body:
{
  "request_id": "unique-request-id",
  "serviceID": "mtn-data", // mtn-data, airtel-data, etc.
  "billersCode": "phone",
  "variation_code": "mtn-1gb",
  "amount": "500",
  "phone": "08111111111"
}
```

### Electricity:
```javascript
POST https://sandbox.vtpass.com/api/pay
Headers:
  api-key: your-api-key
  public-key: your-public-key
Body:
{
  "request_id": "unique-request-id",
  "serviceID": "ikeja-electric",
  "billersCode": "meter-number",
  "variation_code": "prepaid",
  "amount": "2000",
  "phone": "08111111111"
}
```

---

## 🧪 Testing VTpass

### Option 1: Admin Dashboard Test Route

1. Login to admin dashboard
2. Go to Integrations → Add VTpass credentials
3. Test endpoint is at `/api/vtpass/airtime/test` (only works for admin)

### Option 2: Postman/cURL

```bash
# Test VTpass connection
curl -X POST https://nairapay-backend-production.up.railway.app/api/vtpass/airtime/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 Current Status

**Your Current Setup:**
- ✅ Service endpoints created
- ✅ Integration model ready
- ✅ Admin dashboard can add VTpass credentials
- ❌ **Service controller is simulating** - not calling real VTpass yet

**What Happens Now:**
- When you add VTpass integration via admin dashboard
- The service endpoints **will call VTpass API** automatically
- Transactions will be real VTpass purchases!

---

## ⚠️ Important Notes

### Sandbox vs Live:

**Sandbox (`sandbox.vtpass.com`):**
- Free testing
- No real money
- Limited test scenarios
- Use for development

**Live (`vtpass.com`):**
- Real transactions
- Real money
- Need to contact VTpass support to enable
- Use for production

### Current Implementation:

The service controller (`serviceController.js`) currently:
1. Checks wallet balance ✅
2. Creates transaction ✅
3. **Simulates VTpass response** ⚠️ (not calling real API yet)

**To enable real VTpass:**
- Just add VTpass credentials via admin dashboard
- The code will automatically use them!
- (You may need to update serviceController.js to actually call VTpass API)

---

## 🚀 Next Steps

1. **Sign up for VTpass sandbox** account
2. **Get your API keys** (Static API Key, Public Key, Secret Key)
3. **Add integration** in admin dashboard with credentials
4. **Test** using admin test endpoint or service endpoints
5. **Monitor** logs in Railway to see VTpass responses

---

## 📞 VTpass Support

- Documentation: https://www.vtpass.com/documentation
- Support: support@vtpass.com
- Sandbox Dashboard: https://sandbox.vtpass.com

---

## ✅ Quick Checklist

- [ ] Create VTpass sandbox account
- [ ] Get Static API Key
- [ ] Get Public Key
- [ ] Get Secret Key
- [ ] Login to admin dashboard
- [ ] Add VTpass integration with credentials
- [ ] Test airtime purchase
- [ ] Check Railway logs for VTpass response
- [ ] Verify transaction in MongoDB











