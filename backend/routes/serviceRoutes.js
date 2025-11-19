import express from "express";
import { buyAirtime, buyData, payElectricity, getDataPlans } from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All service routes require authentication
router.use(verifyToken);

// Get data plans (must be called before buying data)
router.get("/data-plans", getDataPlans);

// Purchase services
router.post("/airtime", buyAirtime);
router.post("/data", buyData);
router.post("/electricity", payElectricity);

export default router;











