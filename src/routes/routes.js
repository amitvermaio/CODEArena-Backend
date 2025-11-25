import express from "express";
import authRouter from "./auth.route.js";
import userRouter from "./user.route.js";
import problemRouter from "./problem.route.js";
import contestRouter from "./contest.route.js";
import adminRouter from "./admin.route.js";
import toolRouter from "./ai.route.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/problems", problemRouter);
router.use("/contests", contestRouter);
router.use("/tools", toolRouter);
// router.use('/collaboration', collaborationRouter);

export default router;
