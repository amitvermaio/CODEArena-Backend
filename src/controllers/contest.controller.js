import { Contest } from "../models/contest/contest.model.js";
import { Problem } from "../models/problem/problem.model.js";
import { Submission } from "../models/problem/submission.model.js";
import { User } from "../models/user/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFile, deleteFile } from "../utils/ImageKit.js";


export const getAllContests = asyncHandler(async (req, res) => {
  const now = new Date();
  const contests = await Contest.find();
  const upcoming = contests.filter((c) => c.startTime > now);
  const ongoing = contests.filter((c) => c.startTime <= now && c.endTime > now);
  const past = contests.filter((c) => c.endTime <= now);
  return res
    .status(200)
    .json(new ApiResponse(200, { upcoming, ongoing, past }, "All contests"));
});

// Get details of a single contest
export const getContestDetails = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId)
    .populate("problems", "title difficulty")
    .populate("createdBy", "username");
  if (!contest) throw new ApiError(404, "Contest not found");
  return res.status(200).json(new ApiResponse(200, contest, "Contest details"));
});

// Register the logged-in user for a contest
export const registerForContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId);
  if (!contest) throw new ApiError(404, "Contest not found");

  // Prevent registration if the contest has already started
  if (new Date() > contest.startTime) {
    throw new ApiError(
      403,
      "Registration has closed. The contest has already started."
    );
  }

  if (contest.registrants.includes(req.user._id)) {
    throw new ApiError(400, "Already registered");
  }
  contest.registrants.push(req.user._id);
  await contest.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Registered for contest"));
});

// Get the leaderboard for a contest
export const getContestLeaderboard = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId).populate(
    "leaderboard.user",
    "username"
  );
  if (!contest) throw new ApiError(404, "Contest not found");
  // Sort leaderboard by score desc, penalty asc
  const leaderboard = (contest.leaderboard || []).sort(
    (a, b) => b.score - a.score || a.penalty - b.penalty
  );
  return res
    .status(200)
    .json(new ApiResponse(200, leaderboard, "Contest leaderboard"));
});

// Submit a solution for a problem within a contest
export const submitContestSolution = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const { code, language } = req.body;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");
  if (!contest.registrants.includes(req.user._id))
    throw new ApiError(403, "Not registered for contest");
  if (!contest.problems.includes(problemId))
    throw new ApiError(400, "Problem not in contest");
  // Use the same logic as submitSolution in problem.controller.js
  // For brevity, just create a submission and update leaderboard
  const submission = await Submission.create({
    user: req.user._id,
    problem: problemId,
    code,
    language,
    status: "Pending",
  });
  // Update leaderboard (dummy logic, real logic should check correctness, time, etc.)
  let entry = contest.leaderboard.find(
    (e) => e.user.toString() === req.user._id.toString()
  );
  if (!entry) {
    entry = { user: req.user._id, score: 0, penalty: 0, problemStats: {} };
    contest.leaderboard.push(entry);
  }
  // For demo, increment score
  entry.score += 100;
  entry.problemStats[problemId] = { score: 100, attempts: 1, time: new Date() };
  await contest.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { submission }, "Contest submission received"));
});

// Admin: Create a new contest
export const allContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({});
  return res
    .status(200)
    .json(new ApiResponse(200, contests, "Contests fetched successfully"));
});

const convertDurationToMinutes = (duration) => {
  if (!duration) return null;
  if (duration.endsWith("h")) {
    return parseInt(duration) * 60; // "2h" → 120
  }
  if (duration.endsWith("m")) {
    return parseInt(duration); // "90m" → 90
  }
  return null;
};


export const createContest = asyncHandler(async (req, res) => {
  console.log(req.body)
  const {
    title,
    description,
    startTime,
    duration, // ⛔ string e.g. '1h', '2h'
  } = req.body;

  // Convert problems (JSON string → Array of IDs)
  let problems = [];
  if (req.body.problems) {
    try {
      problems = JSON.parse(req.body.problems);
    } catch (err) {
      throw new ApiError(400, "Invalid problems format");
    }
  }

  // Convert duration (string → minutes)
  const length = convertDurationToMinutes(duration);
  if (!length) throw new ApiError(400, "Invalid duration format");

  if (!req.file) throw new ApiError(400, "Cover image is required");

  // Contest must be unique by title
  const existed = await Contest.findOne({ title });
  if (existed) {
    throw new ApiError(400, "Contest with this title already exists");
  }

  try {
    // Upload image (Cloudinary)
    const uploaded = await uploadFile(req.file, "Contests");

    const contest = await Contest.create({
      coverImage: uploaded.url,
      coverImageId: uploaded.fileId,
      title,
      description,
      startTime,
      length,
      problems,
      createdBy: req.user._id,
    });

    return res.status(201).json(
      new ApiResponse(201, contest, "Contest created successfully")
    );
// { id: '1', slug: 'weekly-sprint-24', title: 'Weekly Sprint #24', type: 'platform', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), duration: '2 hours', registered: true, imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop' },
  } catch (err) {
    throw new ApiError(500, err.message);
  }
});

export const updateContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");

  // Handle problems update
  if (req.body.problems) {
    try {
      req.body.problems = JSON.parse(req.body.problems);
    } catch (err) {
      throw new ApiError(400, "Invalid problems format");
    }
  }

  // Handle duration update → convert to minutes
  if (req.body.duration) {
    req.body.length = convertDurationToMinutes(req.body.duration);
    delete req.body.duration;
  }

  try {
    // Update cover image if provided
    if (req.file) {
      await deleteFile(contest.coverImageId);

      const uploaded = await uploadFile(req.file, "Contests");
      req.body.coverImage = uploaded.url;
      req.body.coverImageId = uploaded.fileId;
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      req.body,
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(200, updatedContest, "Contest updated successfully")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(
        500,
        error.message,
        "Error while updating contest details"
      )
    );
  }
});


export const deleteContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new ApiError(404, "Contest Not Found!");
  }

  try {
    await deleteFile(contest.coverImageId);

    await Contest.findByIdAndDelete(contestId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Contest deleted successfully"));
  } catch (error) {
    return res.send(new ApiError(500, "Error Deleting the Contest"));
  }
});
