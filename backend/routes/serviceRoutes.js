import express from "express";
import { buyAirtime, buyData, payElectricity, getDataPlans } from "../controllers/serviceController.js";
import { verifySmartcard, getTVPlans, subscribeTVService } from "../controllers/tvController.js";
import { getEpinPlans, purchaseEpin } from "../controllers/epinController.js";
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

// TV Subscription routes
router.post("/tv/verify", verifySmartcard);
router.get("/tv/plans/:provider", getTVPlans);
router.post("/tv/subscribe", subscribeTVService);
router.post("/tv", subscribeTVService); // Backward compatibility - same as /tv/subscribe

// E-pin routes
router.get("/epin/plans/:category", getEpinPlans);
router.post("/epin/purchase", purchaseEpin);

export default router;
