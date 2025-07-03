// routes/post.routes.js
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createPost,
  getFeed,
  getUserPosts,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment
} from '../controllers/post.controller.js';

const router = express.Router();

// POST /api/v1/posts -> Create a new post
router.post('/', protect, createPost);

// GET /api/v1/posts/feed -> Get home feed
router.get('/feed', protect, getFeed);

// GET /api/v1/posts/user/:username -> Get posts by a specific user
router.get('/user/:username', getUserPosts);

// DELETE /api/v1/posts/:postId -> Delete a post
router.delete('/:postId', protect, deletePost);

// POST /api/v1/posts/:postId/like -> Like/unlike a post
router.post('/:postId/like', protect, toggleLikePost);

// POST /api/v1/posts/:postId/comment -> Add a comment
router.post('/:postId/comment', protect, addComment);

// DELETE /api/v1/posts/:postId/comments/:commentId -> Delete a comment
router.delete('/:postId/comments/:commentId', protect, deleteComment);

export default router;