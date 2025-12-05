# 📱 Frontend Developer - OTP Integration Guide

## 🎯 What You Need to Build

Create an **Email Verification** feature where users can verify their email using a 4-digit OTP code sent to their email.

---

## 🔌 API Endpoints (Ready to Use)

### **Base URL:** 
```
Production: https://your-railway-app.railway.app/api/auth
Local Testing: http://localhost:5000/api/auth
```

---

## 📋 Implementation Steps

### **Step 1: Send OTP to User's Email**

#### **Endpoint:**
```http
POST /api/auth/send-otp
```

#### **Headers:**
```json
{
  "Authorization": "Bearer <USER_JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

#### **Request Body:**
```
None - Just send the request
```

#### **Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### **Error Responses:**
- **404**: User not found
- **400**: Email already verified
- **500**: Failed to send email

---

### **Step 2: Verify OTP Code**

#### **Endpoint:**
```http
POST /api/auth/verify-otp
```

#### **Headers:**
```json
{
  "Authorization": "Bearer <USER_JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

#### **Request Body:**
```json
{
  "otp": "1234"
}
```

#### **Success Response (200):**
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

## 💻 Flutter Code Example

### **1. Create OTP Service File**

Create: `lib/services/otp_service.dart`

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class OTPService {
  static const String baseUrl = "https://your-railway-app.railway.app/api/auth";
  
  // Send OTP to user's email
  static Future<Map<String, dynamic>> sendOTP(String token) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/send-otp'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      return json.decode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: $e'
      };
    }
  }

  // Verify OTP code
  static Future<Map<String, dynamic>> verifyOTP(String token, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/verify-otp'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'otp': otp}),
      );

      return json.decode(response.body);
    } catch (e) {
      return {
        'success': false,
        'error': 'Network error: $e'
      };
    }
  }
}
```

---

### **2. Create Email Verification Screen**

Create: `lib/screens/email_verification_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../services/otp_service.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String userToken;
  final String userEmail;

  const EmailVerificationScreen({
    Key? key,
    required this.userToken,
    required this.userEmail,
  }) : super(key: key);

  @override
  State<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final TextEditingController _otpController = TextEditingController();
  bool _isLoading = false;
  String _message = '';
  bool _otpSent = false;

  // Send OTP
  Future<void> _sendOTP() async {
    setState(() {
      _isLoading = true;
      _message = '';
    });

    final result = await OTPService.sendOTP(widget.userToken);

    setState(() {
      _isLoading = false;
      if (result['success'] == true) {
        _otpSent = true;
        _message = '✅ OTP sent to ${widget.userEmail}';
      } else {
        _message = '❌ ${result['error'] ?? 'Failed to send OTP'}';
      }
    });
  }

  // Verify OTP
  Future<void> _verifyOTP() async {
    if (_otpController.text.trim().length != 4) {
      setState(() {
        _message = '❌ Please enter 4-digit code';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _message = '';
    });

    final result = await OTPService.verifyOTP(
      widget.userToken,
      _otpController.text.trim(),
    );

    setState(() {
      _isLoading = false;
      if (result['success'] == true) {
        _message = '✅ Email verified successfully!';
        // Navigate to home or update user state
        Future.delayed(Duration(seconds: 2), () {
          Navigator.pop(context, true); // Return to previous screen
        });
      } else {
        _message = '❌ ${result['error'] ?? 'Verification failed'}';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Verify Email'),
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.email, size: 80, color: Colors.blue),
            SizedBox(height: 20),
            Text(
              'Verify Your Email',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              widget.userEmail,
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            SizedBox(height: 30),

            // Send OTP Button
            if (!_otpSent)
              ElevatedButton(
                onPressed: _isLoading ? null : _sendOTP,
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Send Verification Code'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                ),
              ),

            // OTP Input (shows after sending)
            if (_otpSent) ...[
              TextField(
                controller: _otpController,
                decoration: InputDecoration(
                  labelText: 'Enter 4-digit code',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
                keyboardType: TextInputType.number,
                maxLength: 4,
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _isLoading ? null : _verifyOTP,
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Verify Code'),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                ),
              ),
              SizedBox(height: 10),
              TextButton(
                onPressed: _isLoading ? null : _sendOTP,
                child: Text('Resend Code'),
              ),
            ],

            SizedBox(height: 20),

            // Message
            if (_message.isNotEmpty)
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _message.contains('✅')
                      ? Colors.green.shade50
                      : Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _message,
                  style: TextStyle(
                    color: _message.contains('✅')
                        ? Colors.green.shade900
                        : Colors.red.shade900,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }
}
```

---

### **3. How to Use in Your App**

#### **Option A: Show verification screen after signup**

```dart
// After user registers successfully
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => EmailVerificationScreen(
      userToken: userToken,  // JWT token from login/register
      userEmail: userEmail,  // User's email address
    ),
  ),
);
```

#### **Option B: Add to settings/profile page**

```dart
// In user settings
if (!user.isEmailVerified) {
  ListTile(
    leading: Icon(Icons.warning, color: Colors.orange),
    title: Text('Verify Email'),
    subtitle: Text('Click to verify your email address'),
    onTap: () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => EmailVerificationScreen(
            userToken: userToken,
            userEmail: userEmail,
          ),
        ),
      );
    },
  ),
}
```

---

## 🎨 UI/UX Flow

### **User Journey:**

1. **User clicks "Verify Email"** (from profile/settings or after signup)
2. **Screen shows "Send Verification Code" button**
3. **User clicks button** → Backend sends OTP email
4. **User receives email** with 4-digit code (e.g., 1234)
5. **Screen shows OTP input field**
6. **User enters code** and clicks "Verify"
7. **Success!** → Navigate back or show success message

### **What the User Sees in Email:**

The user receives a **beautiful HTML email** that looks like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔐 Email Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello [User Name]!

Your Verification Code

    ┌───────────┐
    │   1234    │  ← Big, bold code
    └───────────┘

⏰ This code will expire in 10 minutes.
```

---

## ⏰ Important Details

- **OTP Length:** 4 digits
- **OTP Validity:** 10 minutes
- **One-time use:** OTP is consumed after successful verification
- **Resend:** User can request a new OTP anytime

---

## 🧪 Testing Checklist

- [ ] Can send OTP successfully
- [ ] OTP email arrives in inbox (check spam folder too)
- [ ] Can verify with correct OTP
- [ ] Shows error with invalid OTP
- [ ] Shows error with expired OTP (after 10+ minutes)
- [ ] Can resend new OTP
- [ ] Loading states work correctly
- [ ] Error messages are user-friendly

---

## 🚨 Error Handling Guide

### **Common Errors & What to Show User:**

| Backend Error | User-Friendly Message |
|--------------|----------------------|
| "Email already verified" | "✅ Your email is already verified!" |
| "Invalid OTP" | "❌ Incorrect code. Please try again." |
| "OTP expired" | "⏰ Code expired. Request a new one." |
| Network error | "🌐 Connection error. Check internet." |
| "User not found" | "❌ Session expired. Please login again." |

---

## 📞 Questions?

If you have any issues:
1. Check that `userToken` (JWT) is valid
2. Verify the API base URL is correct
3. Check backend logs for errors
4. Test with Postman first to isolate frontend issues

---

## 🎯 Summary for Frontend Dev

**What you need:**
1. Copy the OTP service code
2. Create the verification screen
3. Add navigation to it from settings/profile
4. Handle success/error states
5. Test with real email

**That's it!** The backend is 100% ready. Just call the two endpoints:
- `/send-otp` → Sends email
- `/verify-otp` → Verifies code

Good luck! 🚀
