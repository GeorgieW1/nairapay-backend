import express from "express";
import {
  getAllKeys,
  createKey,
  updateKey,
  deleteKey,
} from "../controllers/apiKeyController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all API key routes: require authenticated admin
router.use(verifyToken, requireRole("admin"));

router.get("/", getAllKeys);
router.post("/", createKey);
router.put("/:id", updateKey);
router.delete("/:id", deleteKey);

export default router;
