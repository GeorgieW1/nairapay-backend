# 🌐 Generate Your Public Domain - Step by Step

## ✅ What You See:
- **"Public Networking"** section
- **"Generate Service Domain"** button
- Port field showing `8080`

## ✅ Steps to Generate Domain:

### Step 1: Set Correct Port

**IMPORTANT:** Your app runs on port **5000**, not 8080!

1. In the **"Target port"** field, change `8080` to `5000`
   - Or leave it empty if Railway auto-detects (Railway sets PORT automatically)

### Step 2: Generate Domain

2. Click **"Generate Service Domain"** button
3. Railway will create a public domain like:
   ```
   nairapay-backend-production.up.railway.app
   ```

### Step 3: Copy Your URL

4. Once generated, you'll see your public URL
5. Copy it - that's your backend base URL!

---

## 🎯 Your Port Should Be:

**Option 1:** Leave port empty (Railway auto-detects from PORT env var)

**Option 2:** Set port to `5000` manually

**NOT:** `8080` (that's wrong for your app)

---

## ✅ After Generating Domain:

Your URL will be something like:
```
https://nairapay-backend-production.up.railway.app
```

Then your endpoints:
- Health: `https://your-url.railway.app/healthz`
- Login: `https://your-url.railway.app/api/auth/login`
- Admin: `https://your-url.railway.app/admin`

---

## 💡 Note:

If Railway doesn't let you change the port, try leaving it empty. Railway reads the PORT environment variable automatically, and your app should be listening on whatever port Railway assigns.


