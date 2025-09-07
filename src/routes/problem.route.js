import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { createProblemValidation, handleProblemsValidationErrors } from '../validations/problem.validation.js';

import {
  getAllProblems,
  getProblemBySlug,
  submitSolution,
  getMySubmissionsForProblem,
} from '../controllers/problem.controller.js';


const router = express.Router();

// --- User Routes ---
// GET api/v1/problems -> Get all problems (with filters)
router.get('/', protect, getAllProblems);

// GET api/v1/problems/:problemId -> Get a single problem
router.get('/:slug', getProblemBySlug);

// POST api/v1/problems/:problemId/submit -> Submit solution
router.post('/:problemId/submit', protect, submitSolution);

// GET api/v1/problems/:problemId/submissions -> Get my submissions for a problem
router.get('/:problemId/submissions', protect, getMySubmissionsForProblem);


export default router;