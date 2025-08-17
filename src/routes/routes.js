import express from 'express';
import authRouter from './auth.route.js';
import { protect } from '../middlewares/auth.middleware.js';
import userRouter from './user.route.js';
import problemRouter from './problem.route.js';
import postRouter from './post.route.js';
import contestRouter from './contest.route.js';
// import collaborationRouter from './collaboration.route.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/problems', problemRouter);
router.use('/contests', protect, contestRouter);
// router.use('/collaboration', collaborationRouter);

export default router;