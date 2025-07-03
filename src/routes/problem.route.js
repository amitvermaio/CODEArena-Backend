import express from 'express';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { createProblemValidation, handleValidationErrors } from '../validations/problem.validation.js';

import {
  getAllProblems,
  getProblemById,
  submitSolution,
  getMySubmissionsForProblem,
  createProblem,
  updateProblem,
  deleteProblem
} from '../controllers/problem.controller.js';


const router = express.Router();

// --- User Routes ---
// GET api/v1/problems -> Get all problems (with filters)
router.get('/', getAllProblems);

// GET api/v1/problems/:problemId -> Get a single problem
router.get('/:problemId', getProblemById);

// POST api/v1/problems/:problemId/submit -> Submit solution
router.post('/:problemId/submit', protect, submitSolution);

// GET api/v1/problems/:problemId/submissions -> Get my submissions for a problem
router.get('/:problemId/submissions', protect, getMySubmissionsForProblem);


// --- Admin Routes ---
// POST api/v1/problems -> Create a new problem
router.post('/', protect, admin, createProblemValidation, handleValidationErrors, createProblem);

// PUT api/v1/problems/:problemId -> Update a problem
router.put('/:problemId', protect, admin, updateProblem);

// DELETE api/v1/problems/:problemId -> Delete a problem
router.delete('/:problemId', protect, admin, deleteProblem);

export default router;