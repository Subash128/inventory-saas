import express from "express";
import { exportExcel, exportPDF } from "../controllers/exportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/excel", protect, adminOnly, exportExcel);
router.get("/pdf", protect, adminOnly, exportPDF);

export default router;