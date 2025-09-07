import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";
import { createProblemValidation, updateProblemValidation, handleValidationErrors } from "../validations/problem.validation.js";
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  deleteUser,
  getAllProblems,
  createProblem,
  updateProblem, 
  deleteProblem,
  // getAllContests,
  // createContest,
  // updateContest,
  // deleteContest
} from "../controllers/admin.controller.js";

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
router.post("/problems/create", protect, admin, createProblemValidation, handleValidationErrors, createProblem);

// update problem route
router.patch("/problems/:problemId", protect, admin, updateProblemValidation, handleValidationErrors, updateProblem);

// delete problem route
router.delete("/problems/:problemId", protect, admin, deleteProblem);

/* ---------- CONTEST MANAGEMENT ---------- */
router.get("/contests", protect, admin, /* getAllContests */);

router.post("/contests", protect, admin, /* createContest */);

router.put("/contests/:id", protect, admin, /* updateContest */);

router.delete("/contests/:id", protect, admin, /* deleteContest */);

export default router;
