import axios from "axios";
import { Problem } from "../models/problem/problem.model.js";
import { Submission } from "../models/problem/submission.model.js";
import { User } from "../models/user/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const JUDGE0_URL = process.env.JUDGE0_URL;
const JUDGE0_HEADERS = { "x-rapidapi-key": process.env.JUDGE0_API_KEY };

export const submitSolutionService = async (
  user,
  problemId,
  code,
  language
) => {
  if (!code || !language)
    throw new ApiError(400, "Code and language are required");

  const problem = await Problem.findOne({ slug: problemId });
  if (!problem) throw new ApiError(404, "Problem not found");

  let allPassed = true;
  let results = [];

  for (const testCase of problem.testCases) {
    const submissionRes = await axios.post(
      JUDGE0_URL + "?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: language,
        stdin: testCase.input,
        expected_output: testCase.output,
      },
      { headers: JUDGE0_HEADERS }
    );

    const result = submissionRes.data;
    results.push({
      input: testCase.input,
      output: testCase.output,
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      time: result.time,
      memory: result.memory,
    });

    if (result.status.id !== 3) allPassed = false;
  }

  const submission = await Submission.create({
    user: user._id,
    problem: problem._id,
    code,
    language,
    status: allPassed ? "Accepted" : "Wrong Answer",
    executionTime: results.reduce(
      (acc, r) => acc + (parseFloat(r.time) || 0),
      0
    ),
    memoryUsed: results.reduce((acc, r) => acc + (parseInt(r.memory) || 0), 0),
  });

  if (allPassed) {
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { problemSolved: problem._id },
    });
  }

  return { submission, results, allPassed };
};
