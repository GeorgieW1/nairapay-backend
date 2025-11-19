# Flutter App Prompt for LLM

Copy and paste this entire prompt to an LLM (like Claude, ChatGPT, or Gemini) to generate your Flutter frontend:

---

# Build Complete Flutter App for NairaPay Backend

## Project Overview
Create a production-ready Flutter mobile application for **NairaPay** - a Nigerian fintech platform for airtime, data, and utility bill payments with integrated wallet functionality and Paystack payment processing.

## Backend API Information
- **Base URL**: `https://nairapay-backend-production.up.railway.app`
- **Authentication**: JWT Bearer tokens
- **Currency**: Nigerian Naira (₦)
- **Paystack Public Key**: `pk_test_b867557d197b144374335c8bcb107b2f38adfc3c`

## Required Flutter Packages
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  flutter_paystack: ^1.0.7
  provider: ^6.1.1
  intl: ^0.18.1
  fluttertoast: ^8.2.4
  shared_preferences: ^2.2.2
```

## Complete API Endpoints

### Authentication
```dart
// Register
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "walletBalance": 0
  }
}

// Login
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: Same as register

// Verify Token
POST /api/auth/verify-token
Headers: Authorization: Bearer {token}
Response: {
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "..." }
}
```

### Wallet Operations
```dart
// Get Balance
GET /api/wallet/balance
Headers: Authorization: Bearer {token}
Response: {
  "success": true,
  "balance": 15000
}

// Initialize Paystack Payment
POST /api/wallet/paystack/initialize
Headers: Authorization: Bearer {token}
Body: {
  "amount": 5000  // In Naira
}
Response: {
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "WALLET_123_1234567890_abc",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "pending"
  }
}

// Verify Payment
GET /api/wallet/paystack/verify?reference={reference}
Headers: Authorization: Bearer {token}
Response: {
  "success": true,
  "message": "Payment verified successfully",
  "transaction": {
    "_id": "...",
    "amount": 5000,
    "status": "completed"
  },
  "newBalance": 20000
}
```

### Service Purchases
```dart
// Buy Airtime
POST /api/services/airtime
Headers: Authorization: Bearer {token}
Body: {
  "phone": "08012345678",
  "network": "MTN",  // MTN, Airtel, Glo, 9mobile
  "amount": 1000
}
Response: {
  "success": true,
  "message": "Airtime purchased successfully",
  "transaction": {
    "_id": "...",
    "type": "airtime",
    "amount": 1000,
    "status": "completed",
    "phone": "08012345678",
    "network": "MTN"
  },
  "newBalance": 19000
}

// Buy Data
POST /api/services/data
Headers: Authorization: Bearer {token}
Body: {
  "phone": "08012345678",
  "network": "MTN",
  "dataPlan": "1GB",
  "amount": 500
}
Response: Similar to airtime

// Pay Electricity
POST /api/services/electricity
Headers: Authorization: Bearer {token}
Body: {
  "meterNumber": "12345678901",
  "meterType": "prepaid",  // prepaid or postpaid
  "provider": "EKEDC",
  "amount": 5000
}
Response: Similar to airtime
```

### Transactions
```dart
// Get Transaction History
GET /api/transactions
Headers: Authorization: Bearer {token}
Response: {
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "airtime",  // airtime, data, electricity, credit
      "amount": 1000,
      "status": "completed",  // pending, completed, failed
      "description": "Airtime purchase - MTN 08012345678",
      "createdAt": "2024-11-17T10:30:00.000Z",
      "balanceBefore": 20000,
      "balanceAfter": 19000
    }
  ]
}
```

## UI/UX Requirements

### Design Style
- **Modern Nigerian Fintech** (Opay/PalmPay style)
- **Primary Color**: Green (#00C853) or Blue (#2196F3)
- **Accent Color**: Orange (#FF9800) for CTAs
- **Background**: White with subtle gray sections
- **Typography**: Clean, readable fonts (Poppins or Inter)

### App Structure
```
lib/
├── main.dart
├── config/
│   └── app_config.dart          # API URLs, Paystack key
├── models/
│   ├── user.dart
│   ├── transaction.dart
│   └── service_response.dart
├── services/
│   ├── api_service.dart         # HTTP client
│   ├── auth_service.dart        # Login/Register
│   ├── wallet_service.dart      # Balance/Paystack
│   ├── transaction_service.dart # History
│   └── service_purchase.dart    # Airtime/Data/Electricity
├── providers/
│   ├── auth_provider.dart       # User state
│   ├── wallet_provider.dart     # Balance state
│   └── transaction_provider.dart
├── screens/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── register_screen.dart
│   │   └── forgot_password_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── services/
│   │   ├── airtime_screen.dart
│   │   ├── data_screen.dart
│   │   └── electricity_screen.dart
│   ├── wallet/
│   │   └── fund_wallet_screen.dart
│   ├── transactions/
│   │   └── transaction_history_screen.dart
│   └── profile/
│       └── profile_screen.dart
├── widgets/
│   ├── custom_button.dart
│   ├── custom_text_field.dart
│   ├── balance_card.dart
│   ├── quick_action_button.dart
│   └── transaction_tile.dart
└── utils/
    ├── constants.dart
    ├── validators.dart
    └── formatters.dart
```

### Screen Designs

#### 1. Home Screen
```
┌─────────────────────────────────┐
│ 👤 Hi, John                     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 💰 Wallet Balance           │ │
│ │ ₦ 15,000.00                 │ │
│ │ [Fund Wallet] 💳            │ │
│ └─────────────────────────────┘ │
│                                 │
│ Quick Actions                   │
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │📱    │ │📊    │ │⚡    │    │
│ │Airtime│ │Data  │ │Elect.│    │
│ └──────┘ └──────┘ └──────┘    │
│                                 │
│ Recent Transactions             │
│ ┌─────────────────────────────┐ │
│ │ 📱 MTN Airtime              │ │
│ │ ₦1,000 • Completed ✅       │ │
│ │ Nov 17, 2024 • 10:30 AM     │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💳 Wallet Funding           │ │
│ │ ₦5,000 • Completed ✅       │ │
│ │ Nov 17, 2024 • 9:15 AM      │ │
│ └─────────────────────────────┘ │
│                                 │
│ [View All Transactions]         │
└─────────────────────────────────┘
Bottom Nav: [Home] [Services] [Transactions] [Profile]
```

#### 2. Airtime Purchase Screen
```
┌─────────────────────────────────┐
│ ← Buy Airtime                   │
│                                 │
│ Select Network                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │MTN │ │Airt│ │Glo │ │9mob│   │
│ │ ✓  │ │    │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘   │
│                                 │
│ Phone Number                    │
│ ┌─────────────────────────────┐ │
│ │ 08012345678                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ Amount                          │
│ ┌─────────────────────────────┐ │
│ │ ₦ 1000                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Quick Amounts                   │
│ [₦100] [₦200] [₦500] [₦1000]  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Current Balance: ₦15,000    │ │
│ │ After Purchase: ₦14,000     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Purchase Airtime] 🚀           │
└─────────────────────────────────┘
```

#### 3. Fund Wallet Screen (Paystack)
```
┌─────────────────────────────────┐
│ ← Fund Wallet                   │
│                                 │
│ Current Balance                 │
│ ₦ 15,000.00                     │
│                                 │
│ Enter Amount                    │
│ ┌─────────────────────────────┐ │
│ │ ₦ 5000                      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Quick Amounts                   │
│ [₦1,000] [₦2,000] [₦5,000]    │
│ [₦10,000] [₦20,000] [₦50,000] │
│                                 │
│ Payment Method                  │
│ ┌─────────────────────────────┐ │
│ │ 💳 Paystack (Card/Bank)     │ │
│ │ Secure payment via Paystack │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Continue to Payment] 💳        │
│                                 │
│ 🔒 Secured by Paystack          │
└─────────────────────────────────┘
```

## Key Features to Implement

### 1. Authentication Flow
- Login with email/password
- Registration with name, email, password
- JWT token storage (flutter_secure_storage)
- Auto-login on app start if token valid
- Logout functionality

### 2. Wallet Management
- Display current balance prominently
- Fund wallet via Paystack popup
- Real-time balance updates after transactions
- Transaction history with filters

### 3. Service Purchases
- Airtime: Network selection, phone input, amount
- Data: Network selection, plan selection, phone input
- Electricity: Provider selection, meter number, meter type, amount
- Form validation (phone: 11 digits starting with 0)
- Balance check before purchase
- Success/error feedback

### 4. Paystack Integration
```dart
// Initialize Paystack
final plugin = PaystackPlugin();
await plugin.initialize(publicKey: AppConfig.paystackPublicKey);

// Fund wallet flow
1. User enters amount
2. Call POST /api/wallet/paystack/initialize
3. Get reference and access_code
4. Open Paystack checkout:
   final charge = Charge()
     ..amount = (amount * 100).toInt()
     ..email = userEmail
     ..reference = reference
     ..accessCode = accessCode;
   
   final response = await plugin.checkout(context, charge: charge);
   
5. If successful, call GET /api/wallet/paystack/verify?reference={ref}
6. Update balance in UI
```

### 5. Transaction History
- List all transactions (airtime, data, electricity, credit)
- Filter by type
- Status indicators (✅ Completed, ⏳ Pending, ❌ Failed)
- Date grouping
- Pull-to-refresh

### 6. Error Handling
```dart
try {
  // API call
} catch (e) {
  if (e.toString().contains('401')) {
    // Token expired - logout and redirect to login
  } else if (e.toString().contains('400')) {
    // Show user-friendly error message
  } else if (e.toString().contains('500')) {
    // Server error - show retry option
  } else {
    // Network error - check connection
  }
}
```

### 7. Loading States
- Show loading indicator during API calls
- Disable buttons while processing
- Skeleton loaders for lists
- Pull-to-refresh on transaction history

### 8. Form Validation
```dart
// Phone number validator
String? validatePhone(String? value) {
  if (value == null || value.isEmpty) return 'Phone number is required';
  if (value.length != 11) return 'Phone number must be 11 digits';
  if (!value.startsWith('0')) return 'Phone number must start with 0';
  return null;
}

// Amount validator
String? validateAmount(String? value, double balance) {
  if (value == null || value.isEmpty) return 'Amount is required';
  final amount = double.tryParse(value);
  if (amount == null || amount <= 0) return 'Enter valid amount';
  if (amount > balance) return 'Insufficient balance';
  return null;
}
```

## State Management (Provider)

### AuthProvider
```dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;

  Future<void> login(String email, String password);
  Future<void> register(String name, String email, String password);
  Future<void> logout();
  Future<void> loadUserFromStorage();
}
```

### WalletProvider
```dart
class WalletProvider extends ChangeNotifier {
  double _balance = 0;
  bool _isLoading = false;

  double get balance => _balance;
  bool get isLoading => _isLoading;

  Future<void> fetchBalance();
  Future<void> fundWallet(BuildContext context, double amount, String email);
}
```

### TransactionProvider
```dart
class TransactionProvider extends ChangeNotifier {
  List<Transaction> _transactions = [];
  bool _isLoading = false;

  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;

  Future<void> fetchTransactions();
  List<Transaction> filterByType(String type);
}
```

## Testing Requirements

### Test Cards (Paystack)
```
Successful Payment:
Card: 5060 6666 6666 6666 6666
Expiry: 12/25
CVV: 123
PIN: 1234
OTP: 123456

Failed Payment:
Card: 5060 6666 6666 6666 6667
```

### Test Scenarios
1. Login with valid credentials
2. Register new user
3. Fund wallet with ₦5,000
4. Buy MTN airtime ₦1,000
5. Buy data bundle
6. Pay electricity bill
7. View transaction history
8. Logout and login again

## Additional Requirements

### Security
- Store JWT in flutter_secure_storage
- Never log sensitive data
- Validate all user inputs
- Handle token expiration gracefully

### Performance
- Cache user data locally
- Lazy load transaction history
- Optimize images and assets
- Minimize API calls

### UX Enhancements
- Toast notifications for success/error
- Haptic feedback on button press
- Smooth page transitions
- Empty states for lists
- Offline mode detection

### Nigerian Localization
- Currency format: ₦X,XXX.XX
- Phone format: 0801 234 5678
- Date format: Nov 17, 2024
- Network logos (MTN, Airtel, Glo, 9mobile)

## Deliverables

Please provide:
1. Complete Flutter project with all screens
2. API service layer with error handling
3. State management using Provider
4. Paystack integration for wallet funding
5. Form validation for all inputs
6. Loading states and error handling
7. Transaction history with filters
8. Beautiful, modern UI matching Nigerian fintech apps
9. README with setup instructions
10. Comments explaining key logic

## Success Criteria
- ✅ User can register and login
- ✅ User can fund wallet via Paystack
- ✅ User can buy airtime, data, electricity
- ✅ Transaction history shows all purchases
- ✅ Balance updates in real-time
- ✅ Error messages are user-friendly
- ✅ UI is modern and intuitive
- ✅ App works smoothly on Android and iOS

Generate the complete Flutter application following these specifications!
