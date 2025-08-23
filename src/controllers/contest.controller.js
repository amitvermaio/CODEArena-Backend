import Contest from '../models/contest/contest.model.js';
import { Problem } from '../models/problem/problem.model.js';
import { Submission } from '../models/problem/submission.model.js';
import { User } from '../models/user/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all contests (upcoming, ongoing, past)
export const getAllContests = asyncHandler(async (req, res) => {
  const now = new Date();
  const contests = await Contest.find()
    .populate('problems', 'title difficulty')
    .populate('createdBy', 'username');
  const upcoming = contests.filter(c => c.startTime > now);
  const ongoing = contests.filter(c => c.startTime <= now && c.endTime > now);
  const past = contests.filter(c => c.endTime <= now);
  return res.status(200).json(new ApiResponse(200, { upcoming, ongoing, past }, 'All contests'));
});

// Get details of a single contest
export const getContestDetails = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId)
    .populate('problems', 'title difficulty')
    .populate('createdBy', 'username');
  if (!contest) throw new ApiError(404, 'Contest not found');
  return res.status(200).json(new ApiResponse(200, contest, 'Contest details'));
});

// Register the logged-in user for a contest
export const registerForContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');

  // Prevent registration if the contest has already started
  if (new Date() > contest.startTime) {
    throw new ApiError(403, "Registration has closed. The contest has already started.");
  }

  if (contest.registrants.includes(req.user._id)) {
    throw new ApiError(400, 'Already registered');
  }
  contest.registrants.push(req.user._id);
  await contest.save();
  return res.status(200).json(new ApiResponse(200, {}, 'Registered for contest'));
});

// Get the leaderboard for a contest
export const getContestLeaderboard = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId).populate('leaderboard.user', 'username');
  if (!contest) throw new ApiError(404, 'Contest not found');
  // Sort leaderboard by score desc, penalty asc
  const leaderboard = (contest.leaderboard || []).sort((a, b) => b.score - a.score || a.penalty - b.penalty);
  return res.status(200).json(new ApiResponse(200, leaderboard, 'Contest leaderboard'));
});

// Submit a solution for a problem within a contest
export const submitContestSolution = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const { code, language } = req.body;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');
  if (!contest.registrants.includes(req.user._id)) throw new ApiError(403, 'Not registered for contest');
  if (!contest.problems.includes(problemId)) throw new ApiError(400, 'Problem not in contest');
  // Use the same logic as submitSolution in problem.controller.js
  // For brevity, just create a submission and update leaderboard
  const submission = await Submission.create({
    user: req.user._id,
    problem: problemId,
    code,
    language,
    status: 'Pending',
  });
  // Update leaderboard (dummy logic, real logic should check correctness, time, etc.)
  let entry = contest.leaderboard.find(e => e.user.toString() === req.user._id.toString());
  if (!entry) {
    entry = { user: req.user._id, score: 0, penalty: 0, problemStats: {} };
    contest.leaderboard.push(entry);
  }
  // For demo, increment score
  entry.score += 100;
  entry.problemStats[problemId] = { score: 100, attempts: 1, time: new Date() };
  await contest.save();
  return res.status(200).json(new ApiResponse(200, { submission }, 'Contest submission received'));
});

// Admin: Create a new contest
export const createContest = asyncHandler(async (req, res) => {
  const { title, description, type, startTime, endTime, problems, sponsoredBy } = req.body;
  if (!title || !description || !type || !startTime || !endTime || !problems) throw new ApiError(400, 'Missing required fields');
  const contest = await Contest.create({
    title,
    description,
    type,
    startTime,
    endTime,
    problems,
    sponsoredBy,
    createdBy: req.user._id
  });
  return res.status(201).json(new ApiResponse(201, contest, 'Contest created'));
});

// Admin: Update a contest
export const updateContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const update = req.body;
  const contest = await Contest.findByIdAndUpdate(contestId, update, { new: true });
  if (!contest) throw new ApiError(404, 'Contest not found');
  return res.status(200).json(new ApiResponse(200, contest, 'Contest updated'));
});

// Admin: Delete a contest
export const deleteContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const contest = await Contest.findByIdAndDelete(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Contest deleted'));
});