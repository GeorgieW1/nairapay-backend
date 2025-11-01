import express from "express";
import { getBalance, fundWallet } from "../controllers/walletController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wallet routes require authentication
router.use(verifyToken);

router.get("/balance", getBalance);
router.post("/fund", fundWallet);

export default router;

