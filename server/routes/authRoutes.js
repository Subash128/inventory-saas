import express from "express";
import {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    deleteUser,
    updateUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.post("/login", loginUser);

// Protected
router.get("/me", protect, getMe);

// Admin Only
router.post("/register", protect, adminOnly, registerUser);
router.get("/users", protect, adminOnly, getUsers);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;
