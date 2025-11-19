# 🔧 Fix VTpass "INVALID CREDENTIALS" Error

## Step 1: Access Admin Dashboard

1. **Go to:** `https://nairapay-backend-production.up.railway.app/admin`
2. **Login** with your admin account
3. **Click** on "Integrations" button in the sidebar

---

## Step 2: Check Your VTpass Integration

Look for a VTpass integration with:
- **Provider Name:** `VTpass` (case-insensitive)
- **Category:** `airtime` (for airtime purchases)
- **Mode:** `live` (should be "live" for production, not "sandbox")

**Check if:**
- ✅ Integration exists
- ✅ Mode is set to `live`
- ✅ Credentials are present (API Key and Secret Key)

---

## Step 3: Verify Credential Labels

The credentials MUST be labeled correctly:

**Required Credentials:**
1. **API Key** - Label should contain "api" (e.g., "API Key", "api-key", "Api Key")
2. **Secret Key** - Label should contain "secret" (e.g., "Secret Key", "secret-key", "Secret Key")

**Common Issues:**
- ❌ Label is "Public Key" instead of "API Key" or "Secret Key"
- ❌ Credentials are empty or missing
- ❌ Wrong credentials (sandbox credentials used in live mode)

---

## Step 4: Add/Update VTpass Integration

### Option A: Integration Doesn't Exist - Add New One

1. In Admin Dashboard → Integrations section
2. Fill in the form:
   - **Provider Name:** `VTpass`
   - **Category:** `airtime`
   - **Base URL:** `https://vtpass.com/api` (or your VTpass API URL)
   - **Mode:** `live` (important!)
   - **Credentials:**
     - Label: `API Key` → Value: Your VTpass API Key
     - Label: `Secret Key` → Value: Your VTpass Secret Key
3. Click "Add Integration"

### Option B: Integration Exists But Wrong - Delete and Re-add

1. **Delete** the existing VTpass integration (click delete button)
2. **Add new** integration with correct credentials (see Option A)

---

## Step 5: Get Your VTpass Credentials

### If You Don't Have VTpass Account:

1. **Sign up** at https://vtpass.com
2. **Login** to your VTpass dashboard
3. **Go to** API Settings / Credentials section
4. **Copy** your:
   - **API Key**
   - **Secret Key**

### Important Notes:

- **Live Mode:** Use live/production credentials from VTpass dashboard
- **Sandbox Mode:** Only for testing (use sandbox credentials)
- **For Production:** You MUST use `mode: live` with live credentials

---

## Step 6: Verify Correct Setup

After adding/updating, your integration should look like:

```
Provider Name: VTpass
Category: airtime
Mode: live
Base URL: https://vtpass.com/api (or your actual VTpass URL)
Credentials:
  - API Key: abcd1234**** (masked)
  - Secret Key: xyz9876**** (masked)
```

---

## Step 7: Test Again

After fixing credentials:

1. **Try your airtime purchase again** in Postman:
   ```json
   POST https://nairapay-backend-production.up.railway.app/api/services/airtime
   Authorization: Bearer YOUR_TOKEN
   {
     "phone": "08012345678",
     "network": "MTN",
     "amount": 500
   }
   ```

2. **Should work now!** ✅

---

## 🔍 Troubleshooting

### Still Getting "INVALID CREDENTIALS"?

1. **Double-check credentials:**
   - Copy-paste from VTpass dashboard (no extra spaces)
   - Verify they're live credentials (not sandbox)

2. **Check Base URL:**
   - Should be: `https://vtpass.com/api` (or your VTpass API URL)
   - NOT: `https://sandbox.vtpass.com/api` (if using live mode)

3. **Verify Mode:**
   - Mode must be `live` for production
   - Credentials must match the mode (live credentials for live mode)

4. **Check Credential Labels:**
   - API Key label must contain "api"
   - Secret Key label must contain "secret"
   - Case doesn't matter, but spelling does

5. **Test with Different Network:**
   - Try MTN, Airtel, Glo, or 9mobile
   - Some networks might have different requirements

---

## 📝 Quick Checklist

- [ ] VTpass integration exists in admin dashboard
- [ ] Mode is set to `live` (not sandbox)
- [ ] API Key credential exists with label containing "api"
- [ ] Secret Key credential exists with label containing "secret"
- [ ] Credentials are from VTpass live account (not sandbox)
- [ ] Base URL is correct (https://vtpass.com/api)
- [ ] Credentials are not empty or have extra spaces

---

## 🆘 Still Having Issues?

If you're still getting errors after checking everything:

1. **Verify you have VTpass account** with live credentials
2. **Check VTpass dashboard** to ensure API is enabled
3. **Contact VTpass support** if credentials don't work on their platform
4. **Check server logs** in Railway dashboard for more details

---

## 💡 Pro Tip

Create separate integrations for different services:
- VTpass for `airtime` (mode: live)
- VTpass for `electricity` (mode: live)  
- VTpass for `data` (mode: live)

Each can have the same credentials, but different categories help organize them better.

