import express from "express";
import { buyAirtime, buyData, payElectricity } from "../controllers/serviceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All service routes require authentication
router.use(verifyToken);

router.post("/airtime", buyAirtime);
router.post("/data", buyData);
router.post("/electricity", payElectricity);

export default router;











