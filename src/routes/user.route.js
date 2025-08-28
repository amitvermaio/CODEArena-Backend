import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/auth.middleware.js';
import {
  getConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  removeConnection,
  getUserProfile,
  updateAccountDetails,
  followUser,
  unfollowUser,
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

// --- Connection Routes ---

// @route   GET /api/v1/users/connections
// @desc    Get the logged-in user's connections
// @access  Private
router.get('/connections', protect, getConnections);

// @route   POST /api/v1/users/connections/request/:userId
// @desc    Send a connection request to another user
// @access  Private
router.post('/connections/request/:userId', protect, sendConnectionRequest);

// @route   POST /api/v1/users/connections/accept/:requestId
// @desc    Accept a connection request
// @access  Private
router.post('/connections/accept/:requestId', protect, acceptConnectionRequest);

// @route   DELETE /api/v1/users/connections/:userId
// @desc    Remove a connection
// @access  Private
router.delete('/connections/:userId', protect, removeConnection);

// @route   POST /api/v1/users/:username/follow
// @desc    Follow a user
// @access  Private
router.post('/:username/follow', protect, followUser);

// @route   POST /api/v1/users/:username/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:username/unfollow', protect, unfollowUser);

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


// --- Follow, Connections & Notification Routes ---

// @route   GET /api/v1/users/connections
// @desc    Get the logged-in user's connections
// @access  Private
router.get('/connections', protect, getConnections);

// @route   POST /api/v1/users/connections/requests/:userId
// @desc    Send a connection request to another user
// @access  Private
router.post('/connections/requests/:userId', protect, sendConnectionRequest);

// @route   PATCH /api/v1/users/connections/requests/:requestId
// @desc    Accept a connection request
// @access  Private
router.patch('/connections/requests/:requestId', protect, acceptConnectionRequest);

// @route   DELETE /api/v1/users/connections/:userId
// @desc    Remove a connection
// @access  Private
router.delete('/connections/:userId', protect, removeConnection);

// @route   POST /api/v1/users/follow/:username
// @desc    Follow a user
// @access  Private
router.post('/follow/:username', protect, followUser);

// @route   DELETE /api/v1/users/follow/:username
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:username', protect, unfollowUser);

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