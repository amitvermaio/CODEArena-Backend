import express from "express"
const router = express.Router();
import { protect } from '../middlewares/auth.middleware.js';
import { admin } from '../middlewares/admin.middleware.js';

import {
  getAllContests,
  getContestDetails,
  registerForContest,
  getContestLeaderboard,
  submitContestSolution,
  createContest,
  updateContest,
  deleteContest
} from '../controllers/contest.controller.js';


// @route   GET api/v1/contests
// @desc    Get all upcoming, ongoing, and past contests
// @access  Public
router.get('/', getAllContests);

// @route   GET api/v1/contests/:contestId
// @desc    Get details of a single contest
// @access  Public
router.get('/:contestId', getContestDetails);

// @route   POST api/v1/contests/:contestId/register
// @desc    Register the logged-in user for a contest
// @access  Private
router.post('/:contestId/register', protect, registerForContest);

// @route   GET api/v1/contests/:contestId/leaderboard
// @desc    Get the leaderboard for a contest
// @access  Public
router.get('/:contestId/leaderboard', getContestLeaderboard);

// @route   POST api/v1/contests/:contestId/submit/:problemId
// @desc    Submit a solution for a problem within a contest
// @access  Private
router.post('/:contestId/submit/:problemId', protect, submitContestSolution);

// --- Admin Routes ---

// @route   POST api/v1/contests
// @desc    Create a new contest
// @access  Private/Admin
router.post('/', protect, admin, createContest);

// @route   PUT api/v1/contests/:contestId
// @desc    Update a contest (e.g., add problems, change time)
// @access  Private/Admin
router.put('/:contestId', protect, admin, updateContest);

// @route   DELETE api/v1/contests/:contestId
// @desc    Delete a contest
// @access  Private/Admin
router.delete('/:contestId', protect, admin, deleteContest);

export default router;