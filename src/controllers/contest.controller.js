import { Contest } from "../models/contest/contest.model.js";
import { Problem } from "../models/problem/problem.model.js";
import { Submission } from "../models/problem/submission.model.js";
import { User } from "../models/user/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFile, deleteFile } from "../utils/ImageKit.js";

// Get all contests (upcoming, ongoing, past)
export const getAllContests = asyncHandler(async (req, res) => {
  const now = new Date();
  const contests = await Contest.find()
    .populate("problems", "title difficulty")
    .populate("createdBy", "username");
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
export const getAdminAllContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({});
  return res
    .status(200)
    .json(new ApiResponse(200, contests, "Contests fetched successfully"));
});

export const createContest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    registrationDeadline,
    visibility,
    maxParticipants,
    problems,
  } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Cover image is required");
  }

  const existedContest = await Contest.findOne({ title });
  if (existedContest) {
    return res
      .status(404)
      .send(
        new ApiResponse(404, "Contest With This Title already existed", false)
      );
  }

  console.log("req.file: \n", req.file);
  try {
    const coverImage = await uploadFile(req.file, "Contests");
    console.log("Coverimage: \n", coverImage);

    const contest = await Contest.create({
      coverImage: coverImage.url,
      coverImageId: coverImage.fileId,
      title,
      description,
      startTime,
      endTime,
      registrationDeadline,
      visibility,
      maxParticipants,
      problems,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, contest, "Contest created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// ! Pending Not did anything yet!
export const updateContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId);

  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }

  try {
    if (req.file) {
      await deleteFile(contest.coverImageId);
    }

    const uploadResponse = await uploadFile(req.file, "Contests");

    req.body.coverImageId = uploadResponse.fileId;
    req.body.coverImage = uploadResponse.url;

    const updatedContest = await Contest.findByIdAndUpdate(
      contestId,
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .send(
        new ApiResponse(200, updatedContest, "Contest Updated Successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .send(
        new ApiError(
          500,
          error.message,
          "Error While updating Contest details!"
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
