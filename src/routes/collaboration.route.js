import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/auth.middleware.js';
import { startCollaborationSession, inviteUserToSession } from '../controllers/collaboration.controller.js';

// @route   POST api/collaboration/start/:problemId
// @desc    Initiate a new collaboration session for a problem
// @desc    Returns a unique session ID
// @access  Private
router.post('/start/:problemId', protect, startCollaborationSession);

// @route   POST api/collaboration/invite/:sessionId
// @desc    Invite a connection to a collaboration session
// @body    { "inviteeId": "some_user_id" }
// @access  Private
router.post('/invite/:sessionId', protect, inviteUserToSession);

// This part will heavily rely on WebSockets (e.g., Socket.IO) for the actual
// signaling, video streams, and code synchronization. These REST endpoints
// are just for setting up and managing the sessions.

export default router;