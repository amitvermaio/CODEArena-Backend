import { User } from "../models/user/user.model.js";
import { Problem } from "../models/problem/problem.model.js";
// import { Contest } from "../models/contest/contest.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

/* =============================
   USER MANAGEMENT
============================= */

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const changeUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;

    if (!["user", "admin"].includes(newRole)) {
        throw new ApiError(400, "Invalid role specified");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, overwriteImmutable: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { userId: updatedUser._id, newRole: updatedUser.role }, "User role updated successfully")
    );
});

export const changeUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // e.g. "active" | "banned"

    if (!["active", "banned"].includes(status)) {
        throw new ApiError(400, "Invalid status specified");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true, overwriteImmutable: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { userId: updatedUser._id, status: updatedUser.status }, "User status updated successfully")
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndUpdate(
        userId,
        { isDeleted: true },
        { new: true, overwriteImmutable: true }
    );
    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});


/* =============================
   PROBLEM MANAGEMENT
============================= */

export const getAllProblems = asyncHandler(async (req, res) => {
    const problems = await Problem.find({});
    return res.status(200).json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

export const createProblem = asyncHandler(async (req, res) => {
    const { title, statement, difficulty, constraints, testCases, timeLimit, memoryLimit, tags, editorial } = req.body;

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        return res.send(new ApiResponse(400, "Problem with this title already exists"));
    }

    const problem = new Problem({
        title,
        statement,
        difficulty,
        constraints,
        testCases,
        timeLimit,
        memoryLimit,
        tags,
        editorial,
        author: req.user?._id, 
    });

    await problem.save(); 

    return res
        .status(201)
        .json(new ApiResponse(201, problem, "Problem created successfully"));
});

export const updateProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const updatedProblem = await Problem.findByIdAndUpdate(problemId, req.body, { new: true });

    if (!updatedProblem) {
        throw new ApiError(404, "Problem not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedProblem, "Problem updated successfully"));
});

export const deleteProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const deletedProblem = await Problem.findByIdAndDelete(problemId);

    if (!deletedProblem) {
        throw new ApiError(404, "Problem not found");
    }

    return res.status(200).json(new ApiResponse(200, null, "Problem deleted successfully"));
});


/* =============================
   CONTEST MANAGEMENT
============================= */

// export const getAllContests = asyncHandler(async (req, res) => {
//     const contests = await Contest.find({});
//     return res.status(200).json(new ApiResponse(200, contests, "Contests fetched successfully"));
// });

// export const createContest = asyncHandler(async (req, res) => {
//     const contest = await Contest.create(req.body);
//     return res.status(201).json(new ApiResponse(201, contest, "Contest created successfully"));
// });

// export const updateContest = asyncHandler(async (req, res) => {
//     const { contestId } = req.params;
//     const updatedContest = await Contest.findByIdAndUpdate(contestId, req.body, { new: true });

//     if (!updatedContest) {
//         throw new ApiError(404, "Contest not found");
//     }

//     return res.status(200).json(new ApiResponse(200, updatedContest, "Contest updated successfully"));
// });

// export const deleteContest = asyncHandler(async (req, res) => {
//     const { contestId } = req.params;
//     const deletedContest = await Contest.findByIdAndDelete(contestId);

//     if (!deletedContest) {
//         throw new ApiError(404, "Contest not found");
//     }

//     return res.status(200).json(new ApiResponse(200, null, "Contest deleted successfully"));
// });
