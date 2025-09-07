import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/auth.middleware.js';
import {

  getUserProfile,
  updateAccountDetails,
  updateUserAvatar,
  searchUsers,
  getUserBadges,
  getNotifications,
  markNotificationRead
} from '../controllers/user.controller.js';

// @route   GET /api/v1/users/profile/:username
// @desc    Get a user's public profile
// @access  Public
router.get('/profile/:username', getUserProfile);

// @route   PATCH /api/v1/users/profile
// @desc    Update the logged-in user's profile
// @access  Private
router.patch('/me', protect, updateAccountDetails);

// @route POST /api/v1/users/:username/upload
// desc Upload user's avatar photo
// @access Private
router.post('/upload', protect, updateUserAvatar);

export default router;

/*
    markNotificationRead
} from '../controllers/user.controller.js';

// --- User Profile & Search ---

// @route   GET /api/v1/users/search
// @desc    Search for users by query string (e.g., /api/v1/users/search?q=amit)
// @access  Public
router.get('/search', searchUsers);

// @route   GET /api/v1/users/profile/:username
// @desc    Get a user's public profile
// @access  Public
router.get('/profile/:username', getUserProfile);

// @route   PUT /api/v1/users/account
// @desc    Update the logged-in user's profile
// @access  Private
router.put('/account', protect, updateAccountDetails);

// @route   GET /api/v1/users/:username/badges
// @desc    Get a user's badges
// @access  Public
router.get('/:username/badges', getUserBadges);

// @route   GET /api/v1/users/notifications
// @desc    Get notifications for the logged-in user
// @access  Private
router.get('/notifications', protect, getNotifications);

// @route   PATCH /api/v1/users/notifications/:notificationId/read
// @desc    Mark a single notification as read
// @access  Private
router.patch('/notifications/:notificationId/read', protect, markNotificationRead);

export default router;


*/