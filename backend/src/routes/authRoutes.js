import { Router } from "express";
import rateLimit from "express-rate-limit";

import { forgotPassword, googleLogin, login, me, resetPassword, signup } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { forgotSchema, googleSchema, loginSchema, resetSchema, signupSchema } from "../validations/schemas.js";

const router = Router();

// Slow down password guessing and email spamming
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post("/signup", limiter, validate(signupSchema), signup);
router.post("/login", limiter, validate(loginSchema), login);
router.post("/google", limiter, validate(googleSchema), googleLogin);
router.post("/forgot-password", limiter, validate(forgotSchema), forgotPassword);
router.post("/reset-password", limiter, validate(resetSchema), resetPassword);
router.get("/me", protect, me);

export default router;
