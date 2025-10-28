import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controller.js";

// @route   GET /api/v1/users/profile/:username
// @desc    Get a user's public profile
// @access  Public
router.get("/profile/:username", getUserProfile);

// @route   PATCH /api/v1/users/profile
// @desc    Update the logged-in user's profile
// @access  Private
router.patch("/me", protect, updateAccountDetails);

// @route POST /api/v1/users/:username/upload
// desc Upload user's avatar photo
// @access Private
router.post("/upload", protect, updateUserAvatar);

export default router;
