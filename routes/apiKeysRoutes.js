import express from "express";
import {
  getAllKeys,
  createKey,
  updateKey,
  deleteKey,
} from "../controllers/apiKeyController.js";

const router = express.Router();

// Later, you can add middleware like verifyAdmin here

router.get("/", getAllKeys);
router.post("/", createKey);
router.put("/:id", updateKey);
router.delete("/:id", deleteKey);

export default router;
