import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Rate limiter for authentication attempts (e.g. max 20 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  skip: () => process.env.NODE_ENV === "test", // Skip rate limiting during test runs
});

// Authentication routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, getMe);
router.post("/logout", logout);

export default router;
