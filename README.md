# NairaPay Backend API

Backend API for NairaPay - Airtime, Data, and Utility Services Platform

## 🚀 Quick Deploy

See **START_HERE.md** for step-by-step Railway deployment instructions.

## 📋 Features

- User Authentication (JWT)
- Admin Dashboard
- API Key Management
- Service Integrations (VTpass, etc.)
- MongoDB Database
- Firebase Authentication Support

## 🔧 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Firebase Admin SDK
- Helmet (Security)
- CORS

## 📁 Project Structure

```
backend/
├── api/              # Vercel serverless wrapper
├── config/           # Database & Firebase config
├── controllers/      # Route controllers
├── middleware/       # Auth & validation middleware
├── models/           # MongoDB models
├── routes/           # API routes
├── scripts/          # Utility scripts
├── public/           # Static files (JS, CSS)
├── views/            # HTML views
└── server.js         # Main server file
```

## 🔐 Environment Variables

Required:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_ORIGIN` - Frontend URL for CORS

Optional:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## 📚 API Documentation

See `DEPLOYMENT.md` for complete API endpoint documentation.

## 🚀 Local Development

```bash
cd backend
npm install
npm start
```

Server runs on: `http://localhost:5000`

## 📝 License

Private - NairaPay



