import express from "express";
import {
  getAllKeys,
  createKey,
  updateKey,
  deleteKey,
} from "../controllers/apiKeyController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createKeyValidator, updateKeyValidator, idParamValidator } from "../validators/apiKeyValidators.js";

const router = express.Router();

// Protect all API key routes: require authenticated admin
router.use(verifyToken, requireRole("admin"));

router.get("/", getAllKeys);
router.post("/", createKeyValidator, validate, createKey);
router.put("/:id", updateKeyValidator, validate, updateKey);
router.delete("/:id", idParamValidator, validate, deleteKey);

export default router;
