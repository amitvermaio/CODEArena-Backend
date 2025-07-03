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
  searchUsers,
  getUserBadges,
  getNotifications,
  markNotificationRead
} from '../controllers/user.controller.js';

// @route   GET /api/v1/users/profile/:username
// @desc    Get a user's public profile
// @access  Public
router.get('/profile/:username', getUserProfile);

// @route   PUT /api/v1/users/profile
// @desc    Update the logged-in user's profile
// @access  Private
router.put('/profile', protect, updateAccountDetails);

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