import express from "express";
import { getTransactions, getTransaction } from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes require authentication
router.use(verifyToken);

router.get("/", getTransactions);
router.get("/:id", getTransaction);

export default router;











