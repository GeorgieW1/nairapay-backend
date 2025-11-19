# 🔍 All Possible Causes of "INVALID CREDENTIALS" Error

## ✅ Code Fixes Applied

I've updated the code to handle:
1. ✅ Trim whitespace from credentials (removes leading/trailing spaces)
2. ✅ Enhanced debugging (logs credential info without exposing full values)
3. ✅ Base URL normalization (removes trailing slashes)

---

## 🔍 Other Possible Causes

### 1. **Wrong Credentials Environment** ⚠️ MOST COMMON

**Problem:** Using live credentials with sandbox URL (or vice versa)

**Check:**
- Integration Mode: `sandbox` → Must use sandbox credentials from `sandbox.vtpass.com`
- Integration Mode: `live` → Must use live credentials from `vtpass.com`
- Base URL matches mode:
  - Sandbox: `https://sandbox.vtpass.com/api`
  - Live: `https://vtpass.com/api`

**Fix:**
- Use correct credentials for the environment
- Verify credentials are from the correct VTpass dashboard

---

### 2. **Extra Whitespace in Credentials**

**Problem:** Credentials have leading/trailing spaces

**Check:**
- When copying credentials, make sure no extra spaces
- Check in admin dashboard if credentials look correct

**Fix:**
- ✅ Code now automatically trims whitespace
- Manually remove spaces when adding credentials

---

### 3. **Wrong Credential Labels**

**Problem:** Credentials labeled incorrectly (e.g., "Public Key" instead of "Secret Key")

**Check:**
- Credentials must have labels containing:
  - "api" (for API Key)
  - "secret" (for Secret Key)

**Fix:**
- Label should be: `API Key` or `api-key` or `Api Key`
- Label should be: `Secret Key` or `secret-key` or `Secret Key`

---

### 4. **Empty or Missing Credentials**

**Problem:** Credentials exist but are empty strings

**Check:**
- Verify credentials have actual values (not just empty strings)
- Check credential values are not null or undefined

**Fix:**
- Delete and recreate integration with correct values
- Ensure both API Key and Secret Key are filled

---

### 5. **VTpass Account Issues**

**Problem:** VTpass account is locked, suspended, or API access disabled

**VTpass Error Codes:**
- `021`: Account locked
- `022`: Account suspended
- `023`: API access not enabled
- `024`: Account inactive

**Check:**
- Login to VTpass dashboard (sandbox or live)
- Check account status is "Active"
- Verify "API Enabled" is checked

**Fix:**
- Contact VTpass support: support@vtpass.com
- Phone: 07080631810

---

### 6. **IP Whitelisting Required**

**Problem:** VTpass requires IP whitelisting

**VTpass Error Code:**
- `027`: IP not whitelisted

**Check:**
- Railway server IP might not be whitelisted
- VTpass may require IP whitelisting for security

**Fix:**
- Contact VTpass support with your Railway server IP
- Add Railway IP to VTpass whitelist

---

### 7. **Wrong Base URL Format**

**Problem:** Base URL is incorrect or has wrong format

**Check:**
- Sandbox: `https://sandbox.vtpass.com/api` (no trailing slash)
- Live: `https://vtpass.com/api` (no trailing slash)

**Fix:**
- ✅ Code now removes trailing slashes automatically
- Verify base URL matches environment

---

### 8. **Credentials Expired or Regenerated**

**Problem:** Credentials were regenerated but not updated in database

**Check:**
- If you regenerated keys in VTpass dashboard, old keys won't work
- Must update integration with new credentials

**Fix:**
- Get fresh credentials from VTpass dashboard
- Update integration with new credentials

---

### 9. **Wrong API Key Format**

**Problem:** Using wrong type of key

**VTpass Requirements:**
- **Static API Key:** Generated once, always the same
- **Public Key:** For GET requests (starts with `PK_`)
- **Secret Key:** For POST requests (starts with `SK_`)

**For POST requests (buying airtime):**
- Need: API Key + Secret Key
- Do NOT use: Public Key

**Fix:**
- Use API Key + Secret Key (not Public Key) for POST requests

---

### 10. **VTpass API Changes**

**Problem:** VTpass API requirements changed

**Check:**
- Check VTpass API documentation for latest requirements
- Verify header format hasn't changed

**Fix:**
- Visit: https://vtpass.com/documentation
- Update code if requirements changed

---

## 🔧 Enhanced Debugging

The code now logs (server-side, not exposed to client):
- Base URL being used
- Credential lengths (not full values)
- Credential prefixes (first 4 chars)
- Mode (sandbox/live)
- Full VTpass response

Check Railway logs for detailed debugging info.

---

## ✅ Debugging Steps

### Step 1: Check Integration Settings

In Admin Dashboard → Integrations:
- [ ] Mode matches credentials source (sandbox/live)
- [ ] Base URL matches mode
- [ ] API Key is present and not empty
- [ ] Secret Key is present and not empty
- [ ] Labels contain "api" and "secret"

### Step 2: Check VTpass Account

In VTpass Dashboard:
- [ ] Account status is "Active"
- [ ] API access is enabled
- [ ] Using correct environment (sandbox vs live)
- [ ] Credentials are fresh (not regenerated)

### Step 3: Test Directly with VTpass

Test credentials directly with VTpass API:

```bash
curl -X POST https://sandbox.vtpass.com/api/pay \
  -H "api-key: YOUR_API_KEY" \
  -H "secret-key: YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "test123",
    "serviceID": "mtn",
    "amount": "100",
    "phone": "08111111111"
  }'
```

If this works, credentials are correct. If not, issue is with VTpass account/credentials.

---

## 🆘 Still Not Working?

1. **Check Railway Logs:**
   - Go to Railway Dashboard → Your Project → Logs
   - Look for detailed error messages
   - Check for credential debugging info

2. **Contact VTpass Support:**
   - Email: support@vtpass.com
   - Phone: 07080631810
   - Ask about account status and API access

3. **Verify Credentials:**
   - Regenerate credentials in VTpass dashboard
   - Update integration with fresh credentials
   - Test again

---

## 📋 Quick Checklist

- [ ] Credentials are from correct environment (sandbox/live)
- [ ] Base URL matches mode
- [ ] API Key is present and correct
- [ ] Secret Key is present and correct (not Public Key)
- [ ] No extra whitespace in credentials
- [ ] VTpass account is active
- [ ] API access is enabled
- [ ] Using POST requests (needs Secret Key, not Public Key)
- [ ] Credentials haven't been regenerated
- [ ] Railway deployment is updated with latest code

---

## 🎯 Most Likely Issues (In Order)

1. **Wrong environment credentials** (live vs sandbox) - 90%
2. **Account not active or API disabled** - 5%
3. **IP whitelisting required** - 3%
4. **Wrong credential format** - 2%

Start with #1 - verify you're using sandbox credentials with sandbox URL!






