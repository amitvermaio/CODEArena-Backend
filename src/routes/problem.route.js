import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { problemMiddleware } from "../middlewares/problem.middleware.js";

import {
  getAllProblems,
  getProblemBySlug,
  submitSolution,
  getMySubmissionsForProblem,
} from "../controllers/problem.controller.js";
import { getPOTD } from "../controllers/problemOfDay.controller.js";

const router = express.Router();

router.get('/potd', problemMiddleware, getPOTD);

// --- User Routes ---
// GET api/v1/problems -> Get all problems (with filters)
router.get("/", problemMiddleware, getAllProblems);

// GET api/v1/problems/:problemId -> Get a single problem
router.get("/:slug", problemMiddleware, getProblemBySlug);

// POST api/v1/problems/:problemId/submit -> Submit solution
router.post("/:problemId/submit", problemMiddleware, protect, submitSolution);

// GET api/v1/problems/:problemId/submissions -> Get my submissions for a problem
router.get("/:problemId/submissions", problemMiddleware, protect, getMySubmissionsForProblem);

export default router;
