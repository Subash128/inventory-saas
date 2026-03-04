import express from "express";
import {
  createInventory,
  getInventories,
  updateInventory,
  deleteInventory,
  getUserInventory,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// USER + ADMIN can create
router.post("/", protect, upload.single("image"), createInventory);

// USER + ADMIN can update
router.put("/:id", protect, upload.single("image"), updateInventory);

// User's own entries
router.get("/my", protect, getUserInventory);

// ADMIN ONLY
router.get("/", protect, adminOnly, getInventories);
router.delete("/:id", protect, adminOnly, deleteInventory);

export default router;