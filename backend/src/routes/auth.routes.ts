import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { registerValidation, loginValidation } from "../validations/auth.validation.js";
import { handleValidationErrors } from "../middleware/validation.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Registration route
router.post(
  "/register",
  authLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register
);

// Login route
router.post(
  "/login",
  authLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// Get profile info route
router.get("/me", protect, authController.getMe);

export default router;
