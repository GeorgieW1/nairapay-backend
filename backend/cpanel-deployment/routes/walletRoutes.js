import express from "express";
import { 
  getBalance, 
  fundWallet, 
  initializePaystackPayment, 
  verifyPaystackPayment,
  handlePaystackWebhook 
} from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook route (no auth required, Paystack verifies via signature)
// Raw body is handled in server.js middleware
router.post("/paystack/webhook", handlePaystackWebhook);

// All other wallet routes require authentication
router.use(verifyToken);

router.get("/balance", getBalance);
router.post("/fund", fundWallet);
router.post("/paystack/initialize", initializePaystackPayment);
router.get("/paystack/verify", verifyPaystackPayment);

export default router;










