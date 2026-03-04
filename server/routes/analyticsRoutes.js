import express from "express";
import {
  getDashboardSummary,
  getStageDistribution,
  getTagWiseStock,
  getMonthlyGrowth,
  getMonthlyReport,
} from "../controllers/analyticsController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ADMIN ONLY ROUTES
router.get("/summary", protect, adminOnly, getDashboardSummary);
router.get("/stage-distribution", protect, adminOnly, getStageDistribution);
router.get("/tag-stock", protect, adminOnly, getTagWiseStock);
router.get("/monthly-growth", protect, adminOnly, getMonthlyGrowth);
router.get("/monthly-report", protect, adminOnly, getMonthlyReport);

export default router;