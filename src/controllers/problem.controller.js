import { Problem } from '../models/problem/problem.model.js';
import { Submission } from '../models/problem/submission.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { submitSolutionService } from "../services/solution.service.js";


const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

export const getAllProblems = asyncHandler(async (req, res) => {
  // For the problems list page, we only need to send essential information.
  // This reduces payload size and improves performance.
  // `slug` is useful for creating clean URLs on the frontend (e.g., /problems/two-sum).
  // `tags` are useful for filtering.
  const problems = await Problem.find().select('title difficulty tags slug');
  return res.status(200).json(new ApiResponse(200, problems, 'All problems'));
});

export const getProblemById = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ slug: req.params.problemId });
  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // Create a plain object to modify before sending to the user
  const problemResponse = problem.toObject();

  // Remove sensitive or unnecessary top-level fields
  delete problemResponse.author;
  delete problemResponse.createdAt;
  delete problemResponse.updatedAt;
  delete problemResponse.__v;

  // Process test cases to hide sensitive information like the output of hidden tests
  // and internal IDs.
  if (problemResponse.testCases) {
    problemResponse.testCases = problemResponse.testCases.map(tc => {
      const testCaseResponse = {
        input: tc.input,
        isSample: tc.isSample,
      };
      // Only include the 'output' for sample test cases so users can validate their logic.
      if (tc.isSample) {
        testCaseResponse.output = tc.output;
      }
      // The internal '_id' of the test case is not sent.
      return testCaseResponse;
    });
  }

  return res.status(200).json(new ApiResponse(200, problemResponse, 'Problem details'));
});

export const submitSolution = asyncHandler(async (req, res) => {
  const { code, language } = req.body;
  const { problemId } = req.params;

  const { submission, results, allPassed } = await submitSolutionService(
    req.user,
    problemId,
    code,
    language
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { submission, results }, allPassed ? "Accepted" : "Wrong Answer"));
});


export const getMySubmissionsForProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const submissions = await Submission.find({ user: req.user._id, problem: problemId }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, submissions, 'My submissions for problem'));
});

export const createProblem = asyncHandler(async (req, res) => {
  const { title, statement, difficulty, tags, constraints, testCases, timeLimit, memoryLimit, editorial } = req.body;
  if (!title || !statement || !difficulty || !constraints || !testCases) throw new ApiError(400, 'Missing required fields');
  const problem = await Problem.create({
    title,
    statement,
    difficulty,
    tags,
    constraints,
    testCases,
    timeLimit,
    memoryLimit,
    author: req.user._id,
    editorial
  });
  return res.status(201).json(new ApiResponse(201, problem, 'Problem created'));
});

export const updateProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const update = req.body;
  const problem = await Problem.findByIdAndUpdate(problemId, update, { new: true });
  if (!problem) throw new ApiError(404, 'Problem not found');
  return res.status(200).json(new ApiResponse(200, problem, 'Problem updated'));
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const problem = await Problem.findByIdAndDelete(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');
  return res.status(200).json(new ApiResponse(200, {}, 'Problem deleted'));
});