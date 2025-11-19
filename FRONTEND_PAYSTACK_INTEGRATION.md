# Frontend Paystack Integration Guide

## 🎯 What the Frontend Needs

### 1. **Paystack Public Key**
```
pk_test_b867557d197b144374335c8bcb107b2f38adfc3c
```
- **Where to use**: In the frontend code (safe to expose)
- **Purpose**: Initialize Paystack popup
- **Security**: Public key is safe in frontend code

### 2. **Backend API Endpoints**

#### Initialize Payment
```
POST https://nairapay-backend-production.up.railway.app/api/wallet/paystack/initialize

Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Body:
{
  "amount": 5000  // Amount in Naira (NOT kobo)
}

Response:
{
  "success": true,
  "message": "Payment initialized successfully",
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "WALLET_123456_1234567890_abc123",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "pending"
  }
}
```

#### Verify Payment
```
GET https://nairapay-backend-production.up.railway.app/api/wallet/paystack/verify?reference={REFERENCE}

Headers:
  Authorization: Bearer {JWT_TOKEN}

Response (Success):
{
  "success": true,
  "message": "Payment verified successfully",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "completed",
    "createdAt": "..."
  },
  "newBalance": 15000
}
```

### 3. **Paystack Popup Integration Flow**

#### For Flutter (using flutter_paystack package):
```dart
import 'package:flutter_paystack/flutter_paystack.dart';

// 1. Initialize Paystack plugin (in main.dart or app initialization)
final plugin = PaystackPlugin();
await plugin.initialize(publicKey: 'pk_test_b867557d197b144374335c8bcb107b2f38adfc3c');

// 2. Initialize payment with backend
Future<void> fundWallet(double amount, String userEmail) async {
  try {
    // Step 1: Call backend to initialize payment
    final response = await http.post(
      Uri.parse('$baseUrl/api/wallet/paystack/initialize'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'amount': amount}),
    );

    final data = jsonDecode(response.body);
    
    if (!data['success']) {
      throw Exception(data['error'] ?? 'Failed to initialize payment');
    }

    // Step 2: Open Paystack checkout
    final charge = Charge()
      ..amount = (amount * 100).toInt() // Convert to kobo
      ..email = userEmail
      ..reference = data['reference']
      ..accessCode = data['access_code'];

    final checkoutResponse = await plugin.checkout(
      context,
      method: CheckoutMethod.card,
      charge: charge,
    );

    // Step 3: Verify payment with backend
    if (checkoutResponse.status) {
      await verifyPayment(checkoutResponse.reference);
    } else {
      print('Payment cancelled or failed');
    }
  } catch (e) {
    print('Payment error: $e');
  }
}

// 3. Verify payment
Future<void> verifyPayment(String reference) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/wallet/paystack/verify?reference=$reference'),
    headers: {'Authorization': 'Bearer $token'},
  );

  final data = jsonDecode(response.body);
  
  if (data['success']) {
    // Update wallet balance in UI
    print('Payment successful! New balance: ${data['newBalance']}');
  } else {
    print('Payment verification failed');
  }
}
```

#### For Web/React (using Paystack Inline JS):
```javascript
// 1. Include Paystack script in HTML
<script src="https://js.paystack.co/v1/inline.js"></script>

// 2. Initialize payment
async function fundWallet(amount, userEmail) {
  try {
    // Step 1: Initialize with backend
    const response = await fetch('/api/wallet/paystack/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });

    const data = await response.json();

    // Step 2: Open Paystack popup
    const handler = PaystackPop.setup({
      key: 'pk_test_b867557d197b144374335c8bcb107b2f38adfc3c',
      email: userEmail,
      amount: amount * 100, // Convert to kobo
      reference: data.reference,
      callback: function(response) {
        // Payment successful
        verifyPayment(response.reference);
      },
      onClose: function() {
        alert('Payment cancelled');
      }
    });

    handler.openIframe();
  } catch (error) {
    console.error('Payment error:', error);
  }
}

// 3. Verify payment
async function verifyPayment(reference) {
  const response = await fetch(`/api/wallet/paystack/verify?reference=${reference}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  
  if (data.success) {
    alert(`Payment successful! New balance: ₦${data.newBalance}`);
    updateWalletBalance(data.newBalance);
  }
}
```

### 4. **Test Cards for Development**

Use these Paystack test cards during development:

#### Successful Payment:
```
Card Number: 5060 6666 6666 6666 6666
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
PIN: 1234
OTP: 123456
```

#### Failed Payment (for testing error handling):
```
Card Number: 5060 6666 6666 6666 6667
```

### 5. **Important Notes**

#### Amount Conversion:
- **Backend expects**: Naira (e.g., 5000)
- **Paystack expects**: Kobo (e.g., 500000)
- **Frontend must**: Send Naira to backend, convert to kobo for Paystack popup

#### Authentication:
- All API calls require JWT token in Authorization header
- Token format: `Bearer {token}`
- Get token from login response

#### Error Handling:
```dart
// Handle common errors
try {
  // Payment logic
} catch (e) {
  if (e.toString().contains('401')) {
    // Token expired - redirect to login
  } else if (e.toString().contains('400')) {
    // Invalid amount or user error
  } else if (e.toString().contains('500')) {
    // Server error - retry later
  }
}
```

#### Payment Flow Summary:
```
1. User clicks "Fund Wallet"
2. Frontend calls: POST /api/wallet/paystack/initialize
3. Backend returns: reference, access_code, authorization_url
4. Frontend opens Paystack popup with reference
5. User completes payment on Paystack
6. Paystack sends webhook to backend (automatic)
7. Frontend calls: GET /api/wallet/paystack/verify?reference={ref}
8. Backend confirms payment and updates wallet
9. Frontend updates UI with new balance
```

### 6. **Complete Flutter Example**

```dart
class PaystackService {
  final String baseUrl = 'https://nairapay-backend-production.up.railway.app';
  final String publicKey = 'pk_test_b867557d197b144374335c8bcb107b2f38adfc3c';
  final PaystackPlugin plugin = PaystackPlugin();

  Future<void> initialize() async {
    await plugin.initialize(publicKey: publicKey);
  }

  Future<Map<String, dynamic>> fundWallet({
    required BuildContext context,
    required double amount,
    required String userEmail,
    required String token,
  }) async {
    try {
      // 1. Initialize payment with backend
      final initResponse = await http.post(
        Uri.parse('$baseUrl/api/wallet/paystack/initialize'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'amount': amount}),
      );

      if (initResponse.statusCode != 200) {
        throw Exception('Failed to initialize payment');
      }

      final initData = jsonDecode(initResponse.body);

      // 2. Create charge
      final charge = Charge()
        ..amount = (amount * 100).toInt() // Convert to kobo
        ..email = userEmail
        ..reference = initData['reference']
        ..accessCode = initData['access_code'];

      // 3. Open Paystack checkout
      final checkoutResponse = await plugin.checkout(
        context,
        method: CheckoutMethod.card,
        charge: charge,
      );

      if (!checkoutResponse.status) {
        return {
          'success': false,
          'message': 'Payment cancelled or failed',
        };
      }

      // 4. Verify payment with backend
      final verifyResponse = await http.get(
        Uri.parse('$baseUrl/api/wallet/paystack/verify?reference=${checkoutResponse.reference}'),
        headers: {'Authorization': 'Bearer $token'},
      );

      final verifyData = jsonDecode(verifyResponse.body);

      return verifyData;
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}

// Usage in your widget:
final paystackService = PaystackService();

// Initialize in main.dart
await paystackService.initialize();

// Fund wallet
final result = await paystackService.fundWallet(
  context: context,
  amount: 5000,
  userEmail: user.email,
  token: authToken,
);

if (result['success']) {
  print('New balance: ${result['newBalance']}');
  // Update UI
} else {
  print('Error: ${result['message']}');
}
```

### 7. **Environment Variables for Frontend**

```dart
// Create a config file
class AppConfig {
  static const String apiBaseUrl = 'https://nairapay-backend-production.up.railway.app';
  static const String paystackPublicKey = 'pk_test_b867557d197b144374335c8bcb107b2f38adfc3c';
  
  // For production, use:
  // static const String paystackPublicKey = 'pk_live_...';
}
```

---

## ✅ Summary: What Frontend Developer Needs

1. **Paystack Public Key**: `pk_test_b867557d197b144374335c8bcb107b2f38adfc3c`
2. **Backend Base URL**: `https://nairapay-backend-production.up.railway.app`
3. **Initialize Endpoint**: `POST /api/wallet/paystack/initialize`
4. **Verify Endpoint**: `GET /api/wallet/paystack/verify?reference={ref}`
5. **Test Card**: `5060 6666 6666 6666 6666` (PIN: 1234, OTP: 123456)
6. **Flutter Package**: `flutter_paystack: ^1.0.7`
7. **Amount Format**: Send Naira to backend, convert to kobo for Paystack

That's everything the frontend needs to integrate Paystack! 🚀
