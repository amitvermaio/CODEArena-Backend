import express from "express";
import {
  registerValidation,
  loginValidation,
} from "../validations/auth.validation.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  deleteAccount,
  googleAuthSuccess,
} from "../controllers/auth.controller.js";

import passport from "passport";

const router = express.Router();

// --- Local Authentication ---
// @route   POST api/v1/auth/register
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  registerUser
);

// Custom login with email/username and password
router.post("/login", loginValidation, handleValidationErrors, loginUser);

// Logout
router.post("/logout", protect, logoutUser);

router.get("/me", protect, getMe);

router.post('/delete-account', protect, deleteAccount);

// @route   POST api/v1/auth/verify-otp
// router.post('/verify-otp', sendVerifyOtp);

// @route   POST api/v1/auth/verify-account
// router.post('/verify-account', verifyAccount);


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuthSuccess
);

export default router;
