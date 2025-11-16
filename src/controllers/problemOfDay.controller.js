import { ProblemOfDay } from "../models/problem/problemOfDay.model.js";
import { Problem } from "../models/problem/problem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const todayDate = () => new Date().toISOString().split("T")[0];

export const setPOTD = asyncHandler(async (req, res) => {
    const { problemId } = req.body ?? {};

    if (!problemId) {
      throw new ApiError(400, "problemId is required in the request body");
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      throw new ApiError(404, "Problem not found");
    }

    const potd = await ProblemOfDay.findOne({
      date: todayDate(),
    });

    if (potd) {
      throw new ApiError(400, "Problem of the day already set");
    }

    const newPotd = await ProblemOfDay.create({
      problemId,
      date: todayDate(),
    });

    res.status(201).json(new ApiResponse(201, newPotd, "Problem of the day set successfully"));
});

export const getPOTD = asyncHandler(async (req, res) => {
    const todaysProblem = await ProblemOfDay.findOne({
        date: todayDate(),
    });

    if (!todaysProblem) {
        throw new ApiError(404, "Problem of the day not found");
    }

    const problem = await Problem.findById(todaysProblem.problemId);

    if (!problem) {
        throw new ApiError(404, "Problem of the day not found");
    }

    res.status(200).json(
        new ApiResponse(200, problem, "Problem of the day found successfully")
    );
});

