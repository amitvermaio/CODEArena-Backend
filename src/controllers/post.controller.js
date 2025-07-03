import Post from '../models/social/post.model.js';
import Comment from '../models/social/comment.model.js';
import { User } from '../models/user/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
  const { caption, tags } = req.body;
  const imageUrl = req.body.imageUrl || null;
  if (!caption || caption.trim() === '') {
    throw new ApiError(400, 'Caption is required');
  }
  const post = await Post.create({
    user: req.user._id,
    imageUrl,
    caption,
    tags: tags || []
  });
  return res.status(201).json(new ApiResponse(201, post, 'Post created'));
});

// Get home feed (posts from followed users and self)
export const getFeed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const following = user.connections || [];
  const posts = await Post.find({ user: { $in: [user._id, ...following] } })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePic')
    .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePic' } });
  return res.status(200).json(new ApiResponse(200, posts, 'User feed'));
});

// Get posts by a specific user
export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) throw new ApiError(404, 'User not found');
  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePic')
    .populate({ path: 'comments', populate: { path: 'user', select: 'username profilePic' } });
  return res.status(200).json(new ApiResponse(200, posts, `Posts by user ${username}`));
});

// Delete a post
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (!post.user.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, `Post ${postId} deleted`));
});

// Like or unlike a post
export const toggleLikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  const liked = post.likes.includes(req.user._id);
  if (liked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  return res.status(200).json(new ApiResponse(200, { liked: !liked }, `Toggled like for post ${postId}`));
});

// Add a comment to a post
export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  if (!text || text.trim() === '') throw new ApiError(400, 'Comment text is required');
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'Post not found');
  const comment = await Comment.create({ user: req.user._id, post: post._id, text });
  post.comments.push(comment._id);
  await post.save();
  return res.status(201).json(new ApiResponse(201, comment, `Comment added to post ${postId}`));
});

// Delete a comment from a post
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');
  if (!comment.user.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  await comment.deleteOne();
  await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
  return res.status(200).json(new ApiResponse(200, {}, `Comment ${commentId} deleted from post ${postId}`));
});