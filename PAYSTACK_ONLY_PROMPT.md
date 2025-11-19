# Add Paystack Wallet Funding to Existing Flutter App

## Context
I have an existing Flutter app for NairaPay (Nigerian fintech platform). The app already has authentication, wallet display, and service purchases working. I need to add **Paystack integration for wallet funding only**.

## What I Need
Add Paystack inline checkout to allow users to fund their wallet using cards/bank transfers.

## Backend API (Already Working)

### Initialize Payment
```dart
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
  "access_code": "abc123xyz",
  "reference": "WALLET_123456_1234567890_abc123",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "pending"
  }
}
```

### Verify Payment
```dart
GET https://nairapay-backend-production.up.railway.app/api/wallet/paystack/verify?reference={REFERENCE}

Headers:
  Authorization: Bearer {JWT_TOKEN}

Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "completed",
    "createdAt": "2024-11-17T10:30:00.000Z"
  },
  "newBalance": 20000
}
```

## Paystack Configuration
- **Public Key**: `pk_test_b867557d197b144374335c8bcb107b2f38adfc3c`
- **Mode**: Test (for development)
- **Integration Type**: Inline checkout (popup inside app, NOT browser redirect)

## Required Package
```yaml
dependencies:
  flutter_paystack: ^1.0.7
```

## Implementation Requirements

### 1. Initialize Paystack Plugin
Add this to your `main.dart` or app initialization:
```dart
import 'package:flutter_paystack/flutter_paystack.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Paystack
  final plugin = PaystackPlugin();
  await plugin.initialize(
    publicKey: 'pk_test_b867557d197b144374335c8bcb107b2f38adfc3c'
  );
  
  runApp(MyApp());
}
```

### 2. Create Paystack Service
Create a service class to handle Paystack operations:

```dart
class PaystackService {
  final String baseUrl = 'https://nairapay-backend-production.up.railway.app';
  final PaystackPlugin plugin = PaystackPlugin();
  
  Future<Map<String, dynamic>> fundWallet({
    required BuildContext context,
    required double amount,
    required String userEmail,
    required String authToken,
  }) async {
    try {
      // Step 1: Initialize payment with backend
      final initResponse = await http.post(
        Uri.parse('$baseUrl/api/wallet/paystack/initialize'),
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'amount': amount}),
      );

      if (initResponse.statusCode != 200) {
        final error = jsonDecode(initResponse.body);
        throw Exception(error['error'] ?? 'Failed to initialize payment');
      }

      final initData = jsonDecode(initResponse.body);

      // Step 2: Create Paystack charge
      final charge = Charge()
        ..amount = (amount * 100).toInt() // Convert Naira to kobo
        ..email = userEmail
        ..reference = initData['reference']
        ..accessCode = initData['access_code'];

      // Step 3: Open Paystack checkout (inline popup)
      final checkoutResponse = await plugin.checkout(
        context,
        method: CheckoutMethod.card, // Inline checkout
        charge: charge,
      );

      // Step 4: Handle checkout response
      if (!checkoutResponse.status) {
        return {
          'success': false,
          'message': checkoutResponse.message ?? 'Payment cancelled',
        };
      }

      // Step 5: Verify payment with backend
      final verifyResponse = await http.get(
        Uri.parse('$baseUrl/api/wallet/paystack/verify?reference=${checkoutResponse.reference}'),
        headers: {'Authorization': 'Bearer $authToken'},
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
```

### 3. Fund Wallet Screen UI
Create a screen where users can enter amount and fund wallet:

```dart
class FundWalletScreen extends StatefulWidget {
  @override
  _FundWalletScreenState createState() => _FundWalletScreenState();
}

class _FundWalletScreenState extends State<FundWalletScreen> {
  final TextEditingController _amountController = TextEditingController();
  final PaystackService _paystackService = PaystackService();
  bool _isLoading = false;

  // Quick amount buttons
  final List<double> quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  void _selectQuickAmount(double amount) {
    _amountController.text = amount.toStringAsFixed(0);
  }

  Future<void> _fundWallet() async {
    final amountText = _amountController.text.trim();
    
    if (amountText.isEmpty) {
      _showError('Please enter amount');
      return;
    }

    final amount = double.tryParse(amountText);
    if (amount == null || amount <= 0) {
      _showError('Please enter valid amount');
      return;
    }

    if (amount < 100) {
      _showError('Minimum amount is ₦100');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Get user email and token from your auth provider/state
      final userEmail = 'user@example.com'; // Replace with actual user email
      final authToken = 'your_jwt_token'; // Replace with actual token

      final result = await _paystackService.fundWallet(
        context: context,
        amount: amount,
        userEmail: userEmail,
        authToken: authToken,
      );

      setState(() => _isLoading = false);

      if (result['success']) {
        _showSuccess('Wallet funded successfully! New balance: ₦${result['newBalance']}');
        // Update wallet balance in your state management
        Navigator.pop(context); // Go back to previous screen
      } else {
        _showError(result['message'] ?? 'Payment failed');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Error: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Fund Wallet'),
        backgroundColor: Colors.green,
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Current Balance Display
            Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                children: [
                  Text('Current Balance', style: TextStyle(fontSize: 16)),
                  SizedBox(height: 8),
                  Text(
                    '₦ 15,000.00', // Replace with actual balance
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            SizedBox(height: 30),

            // Amount Input
            Text('Enter Amount', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            SizedBox(height: 10),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                prefixText: '₦ ',
                hintText: '5000',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                filled: true,
                fillColor: Colors.grey.shade100,
              ),
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),

            // Quick Amount Buttons
            Text('Quick Amounts', style: TextStyle(fontSize: 14, color: Colors.grey)),
            SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: quickAmounts.map((amount) {
                return ElevatedButton(
                  onPressed: () => _selectQuickAmount(amount),
                  child: Text('₦${amount.toStringAsFixed(0)}'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey.shade200,
                    foregroundColor: Colors.black,
                  ),
                );
              }).toList(),
            ),
            SizedBox(height: 30),

            // Payment Method Info
            Container(
              padding: EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(Icons.credit_card, color: Colors.blue),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Paystack Payment', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text('Secure payment via card or bank transfer', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 30),

            // Fund Wallet Button
            ElevatedButton(
              onPressed: _isLoading ? null : _fundWallet,
              child: _isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Continue to Payment', style: TextStyle(fontSize: 18)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            SizedBox(height: 15),

            // Security Badge
            Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.lock, size: 16, color: Colors.grey),
                  SizedBox(width: 5),
                  Text('Secured by Paystack', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 4. Integration with Existing App

#### If you're using Provider for state management:
```dart
// In your WalletProvider or similar
class WalletProvider extends ChangeNotifier {
  double _balance = 0;
  final PaystackService _paystackService = PaystackService();

  double get balance => _balance;

  Future<void> fundWallet(BuildContext context, double amount, String email, String token) async {
    final result = await _paystackService.fundWallet(
      context: context,
      amount: amount,
      userEmail: email,
      authToken: token,
    );

    if (result['success']) {
      _balance = result['newBalance'];
      notifyListeners();
    }

    return result;
  }
}
```

#### Navigation to Fund Wallet Screen:
```dart
// From your home screen or wallet screen
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => FundWalletScreen()),
    );
  },
  child: Text('Fund Wallet'),
)
```

## Test Cards (Paystack Test Mode)

### Successful Payment:
```
Card Number: 5060 6666 6666 6666 6666
Expiry: 12/25 (any future date)
CVV: 123 (any 3 digits)
PIN: 1234
OTP: 123456
```

### Failed Payment (for testing error handling):
```
Card Number: 5060 6666 6666 6666 6667
```

## Error Handling

Handle these common scenarios:
```dart
// Network error
if (e.toString().contains('SocketException')) {
  return 'No internet connection';
}

// Token expired
if (response.statusCode == 401) {
  return 'Session expired. Please login again';
}

// Insufficient balance (shouldn't happen for funding, but good to handle)
if (response.statusCode == 400) {
  final error = jsonDecode(response.body);
  return error['error'] ?? 'Invalid request';
}

// Server error
if (response.statusCode == 500) {
  return 'Server error. Please try again later';
}
```

## Important Notes

1. **Amount Conversion**:
   - Backend expects: **Naira** (e.g., 5000)
   - Paystack expects: **Kobo** (e.g., 500000)
   - Always multiply by 100 when creating Paystack charge

2. **Authentication**:
   - All API calls need JWT token in Authorization header
   - Format: `Bearer {token}`

3. **User Email**:
   - Required for Paystack checkout
   - Get from your auth state/provider

4. **Inline Checkout**:
   - Use `CheckoutMethod.card` for popup inside app
   - NOT `CheckoutMethod.browser` (that redirects to browser)

5. **Verification**:
   - Always verify payment with backend after Paystack success
   - Don't trust frontend-only verification

## Deliverables

Please provide:
1. `PaystackService` class with fundWallet method
2. `FundWalletScreen` widget with UI
3. Integration code for my existing app structure
4. Error handling for common scenarios
5. Loading states during payment
6. Success/error feedback to user

## Success Criteria
- ✅ User can enter amount and see quick amount buttons
- ✅ Paystack popup opens inside app (not browser)
- ✅ User can complete payment with test card
- ✅ Payment is verified with backend
- ✅ Wallet balance updates after successful payment
- ✅ Error messages are user-friendly
- ✅ Loading indicators show during processing

Generate the Paystack wallet funding integration code following these specifications!
