import express from "express";
import { upload } from "../services/multer.service.js";
import { protect } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";
import { createProblemValidation, updateProblemValidation, handleProblemsValidationErrors } from "../validations/problem.validation.js";
import { createContestValidation, handleContestValidationErrors } from "../validations/contest.validation.js";
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  deleteUser 
} from "../controllers/user.controller.js";
import { getAllProblems, createProblem, updateProblem, deleteProblem } from "../controllers/problem.controller.js";
import {
  getAdminAllContests,
  createContest, 
  updateContest, 
  deleteContest
 } from "../controllers/contest.controller.js";

const router = express.Router();

/* ---------- USER MANAGEMENT ---------- */
router.get("/users", protect, admin, getAllUsers);

router.patch("/users/:userId/role", protect, admin, changeUserRole);

router.patch("/users/:userId/status", protect, admin, changeUserStatus);

router.patch("/users/:userId/delete", protect, admin, deleteUser);

router.patch("/users/:userId/restore", protect, admin, /* restoreUser */);

/* ---------- PROBLEM MANAGEMENT ---------- */
// get all problems route
router.get("/problems", protect, admin, getAllProblems);

// create problem route
router.post("/problems/create", protect, admin, createProblemValidation, handleProblemsValidationErrors, createProblem);

// update problem route
router.patch("/problems/:problemId", protect, admin, updateProblemValidation, handleProblemsValidationErrors, updateProblem);

// delete problem route
router.delete("/problems/:problemId", protect, admin, deleteProblem);

/* ---------- CONTEST MANAGEMENT ---------- */
router.get("/contests", protect, admin, getAdminAllContests);

router.post("/contests", protect, admin, upload.single('coverImage'), createContestValidation, handleContestValidationErrors, createContest);

router.put("/contests/:contestId", protect, admin, /* updateContest */);

router.delete("/contests/:contestId", protect, admin, deleteContest);

export default router;
