// Vercel serverless function wrapper for Express app
import app from '../server.js';

// For Vercel, we need to ensure DB connection happens on first request
let dbConnected = false;

export default async function handler(req, res) {
  // Connect DB on first request (Vercel serverless)
  if (!dbConnected) {
    const connectDB = (await import('../config/db.js')).default;
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('DB connection failed:', err);
    }
  }
  
  // Handle request with Express app
  return app(req, res);
}

