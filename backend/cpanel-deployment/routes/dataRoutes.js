import express from "express";
import { getDataPlans } from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All data routes require authentication
router.use(verifyToken);

// Get data plans - alias route to match frontend expectations
router.get("/plans", getDataPlans);

export default router;
