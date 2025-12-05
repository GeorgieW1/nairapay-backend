# 📧 OTP Service Implementation Guide

## ✅ Backend Status: **FULLY ENABLED**

Your NairaPay backend has a **complete and functional OTP service** for email verification. Here's what's implemented:

---

## 🔍 Current Backend Implementation

### 1. **API Endpoints** (✅ Active)

Located in: `backend/routes/authRoutes.js`

```javascript
// Email OTP Verification Endpoints
router.post("/send-otp", authMiddleware, sendEmailOTP);    // Send OTP to user's email
router.post("/verify-otp", authMiddleware, verifyEmailOTP); // Verify OTP
```

🔗 **Full Endpoint URLs:**
- **Send OTP:** `POST /api/auth/send-otp`
- **Verify OTP:** `POST /api/auth/verify-otp`

---

### 2. **Database Fields** (✅ Ready)

Located in: `backend/models/User.js`

```javascript
// Email Verification fields in User model
isEmailVerified: { type: Boolean, default: false },
emailVerificationOTP: { type: String },
emailVerificationExpires: { type: Date }, // OTP expires in 10 minutes
```

---

### 3. **Email Service** (✅ Configured)

Located in: `backend/services/emailService.js`

- Uses **Nodemailer** with SMTP
- Sends beautifully styled HTML emails
- 4-digit OTP codes
- 10-minute expiration time

---

### 4. **Controller Logic** (✅ Complete)

Located in: `backend/controllers/authController.js`

**Features:**
- ✅ Generates 4-digit OTP
- ✅ Stores OTP in database with expiration
- ✅ Sends styled email to user
- ✅ Validates OTP on submission
- ✅ Checks expiration time
- ✅ Marks email as verified
- ✅ Prevents duplicate verification

---

## 📱 Frontend Implementation Steps

If you want to implement OTP verification in your **Flutter/React/Web** frontend, follow these steps:

---

## 🚀 Step-by-Step Frontend Integration

### **STEP 1: Send OTP Request**

When the user needs to verify their email (e.g., after registration or in a settings page), make this API call:

#### **API Request:**
```http
POST /api/auth/send-otp
Authorization: Bearer <JWT_TOKEN>
```

#### **Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### **Error Responses:**
- `404`: User not found
- `400`: Email already verified
- `500`: Failed to send email

---

### **STEP 2: User Receives Email**

The user will receive a **professionally styled email** with:
- 🎨 Gradient header (purple theme)
- 🔢 Large, bold 4-digit OTP code
- ⏰ 10-minute expiration notice
- 📧 From: "NairaPay"

**Example Email Content:**
```
Subject: ✉️ Email Verification Code - NairaPay

Hello [User's Name]!

Your Verification Code:
┌─────────┐
│  1234   │  ← Large, bold OTP
└─────────┘

⏰ This code will expire in 10 minutes.
```

---

### **STEP 3: Verify OTP**

Once the user enters the OTP in your app, send it to verify:

#### **API Request:**
```http
POST /api/auth/verify-otp
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "otp": "1234"
}
```

#### **Success Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### **Error Responses:**
```json
{
  "success": false,
  "error": "Invalid OTP"
}
```

```json
{
  "success": false,
  "error": "OTP expired. Request a new one"
}
```

---

## 💻 Sample Frontend Code

### **For Flutter (Dart)**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class OTPService {
  final String baseUrl = "https://your-api.com/api/auth";
  final String token; // User's JWT token

  OTPService(this.token);

  // Step 1: Send OTP
  Future<Map<String, dynamic>> sendOTP() async {
    final response = await http.post(
      Uri.parse('$baseUrl/send-otp'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    return json.decode(response.body);
  }

  // Step 2: Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String otp) async {
    final response = await http.post(
      Uri.parse('$baseUrl/verify-otp'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({'otp': otp}),
    );

    return json.decode(response.body);
  }
}

// Usage Example
void verifyUserEmail() async {
  final otpService = OTPService(userToken);
  
  // Send OTP
  final sendResult = await otpService.sendOTP();
  if (sendResult['success']) {
    print('✅ OTP sent! Check your email.');
    
    // After user enters OTP
    String userEnteredOTP = '1234'; // From text input
    final verifyResult = await otpService.verifyOTP(userEnteredOTP);
    
    if (verifyResult['success']) {
      print('✅ Email verified!');
    } else {
      print('❌ ${verifyResult['error']}');
    }
  }
}
```

---

### **For React/JavaScript**

```javascript
// otpService.js
const API_BASE = 'https://your-api.com/api/auth';

export const sendOTP = async (token) => {
  const response = await fetch(`${API_BASE}/send-otp`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};

export const verifyOTP = async (token, otp) => {
  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp }),
  });
  return await response.json();
};

// Usage in React Component
import { sendOTP, verifyOTP } from './otpService';

function EmailVerification() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('authToken');

  const handleSendOTP = async () => {
    const result = await sendOTP(token);
    if (result.success) {
      setMessage('✅ OTP sent to your email!');
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(token, otp);
    if (result.success) {
      setMessage('✅ Email verified successfully!');
      // Update user state to show verified status
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div>
      <button onClick={handleSendOTP}>Send OTP</button>
      <input 
        type="text" 
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerifyOTP}>Verify</button>
      <p>{message}</p>
    </div>
  );
}
```

---

## 🎨 UI/UX Recommendations

### **Best Practices for OTP Flow:**

1. **Request OTP Button**
   - Show "Verify Email" or "Send Verification Code" button
   - Disable if email is already verified
   
2. **OTP Input Field**
   - Use 4 separate input boxes (one per digit) for better UX
   - Or use a single input with max length 4
   - Auto-focus on input after sending OTP
   
3. **Timer Display**
   - Show countdown: "Code expires in 9:45"
   - Allow resending after expiration
   
4. **Loading States**
   - Show spinner while sending OTP
   - Show spinner while verifying
   
5. **Success/Error Messages**
   - ✅ "Code sent! Check your email"
   - ❌ "Invalid code. Try again"
   - ⏰ "Code expired. Request a new one"
   
6. **Verified Badge**
   - Show a verified icon/badge next to email once verified

---

## 🛡️ Security Features (Already Implemented)

✅ **Authentication Required** - OTP endpoints require JWT token  
✅ **Time-based Expiration** - OTP expires in 10 minutes  
✅ **One-time Use** - OTP is deleted after successful verification  
✅ **No Duplicate Verification** - Prevents re-verification  
✅ **Secure Generation** - Random 4-digit codes  

---

## 📋 Environment Variables Needed

Make sure these are set in your `.env` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key

# Optional: Admin email for alerts
ADMIN_EMAIL=admin@nairapay.com
```

---

## ✅ Testing Checklist

Before deploying to production:

- [ ] Test sending OTP to real email address
- [ ] Verify email template displays correctly
- [ ] Test with valid OTP code
- [ ] Test with invalid OTP code
- [ ] Test with expired OTP (wait 10+ minutes)
- [ ] Test resending new OTP
- [ ] Test preventing verification of already-verified email
- [ ] Test without authentication token (should fail)

---

## 🚨 Common Issues & Solutions

### **Problem: Not receiving OTP emails**

**Solutions:**
1. Check SMTP credentials in `.env`
2. Check email spam/junk folder
3. Verify SMTP_HOST and SMTP_PORT are correct
4. Ensure "Less secure app access" is enabled (for Gmail)
5. Use Gmail App Password instead of regular password

### **Problem: OTP expires too quickly**

**Solution:**
Modify the expiration time in `authController.js`:
```javascript
user.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
```

### **Problem: User doesn't receive styled email**

**Solution:**
Email client might not support HTML. The content will still be readable but may appear unstyled.

---

## 📞 Support

For issues or questions:
- Email: support@nairapay.com
- Check backend logs for email sending errors

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready
