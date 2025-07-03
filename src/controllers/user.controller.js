import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Badge from '../models/user/badge.model.js';
import Notification from '../models/platform/notification.model.js';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .cookie(process.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, options)
        .cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged In Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    return res
        .status(200)
        .clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME, options)
        .clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName && !email) {
        throw new ApiError(400, "At least one field to update is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { fullName, email } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const user = await User.findOne({ username }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Here you would also fetch user's posts, problems solved, contest history etc.
    // For now, we just return the user object.

    return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const followUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username || username === req.user.username) {
        throw new ApiError(400, "Invalid username to follow");
    }
    const userToFollow = await User.findOne({ username });
    if (!userToFollow) throw new ApiError(404, "User not found");
    if (userToFollow.connections.includes(req.user._id)) {
        throw new ApiError(400, "Already following this user");
    }
    userToFollow.connections.push(req.user._id);
    await userToFollow.save();
    return res.status(200).json(new ApiResponse(200, {}, `Now following ${username}`));
});

const unfollowUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username || username === req.user.username) {
        throw new ApiError(400, "Invalid username to unfollow");
    }
    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) throw new ApiError(404, "User not found");
    userToUnfollow.connections = userToUnfollow.connections.filter(
        (id) => id.toString() !== req.user._id.toString()
    );
    await userToUnfollow.save();
    return res.status(200).json(new ApiResponse(200, {}, `Unfollowed ${username}`));
});

const getConnections = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('connections', 'username profilePic fullName');
    return res.status(200).json(new ApiResponse(200, user.connections, 'User connections'));
});

const sendConnectionRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) throw new ApiError(400, 'Cannot connect to yourself');
    const targetUser = await User.findById(userId);
    if (!targetUser) throw new ApiError(404, 'User not found');
    // For demo, just auto-accept (real app: use a ConnectionRequest model)
    if (targetUser.connections.includes(req.user._id)) throw new ApiError(400, 'Already connected');
    targetUser.connections.push(req.user._id);
    await targetUser.save();
    return res.status(200).json(new ApiResponse(200, {}, 'Connection request sent and auto-accepted'));
});

const acceptConnectionRequest = asyncHandler(async (req, res) => {
    // For demo, just acknowledge (real app: use a ConnectionRequest model)
    return res.status(200).json(new ApiResponse(200, {}, 'Connection request accepted'));
});

const removeConnection = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);
    user.connections = user.connections.filter(id => id.toString() !== userId);
    await user.save();
    return res.status(200).json(new ApiResponse(200, {}, 'Connection removed'));
});

const searchUsers = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.status(200).json(new ApiResponse(200, [], 'No search query'));
    const users = await User.find({
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { fullName: { $regex: q, $options: 'i' } }
        ]
    }).select('username fullName profilePic');
    return res.status(200).json(new ApiResponse(200, users, 'User search results'));
});

const getUserBadges = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId || req.user._id).populate('badges');
    return res.status(200).json(new ApiResponse(200, user.badges, 'User badges'));
});

// Award badges based on activity (call after login or problem submission)
const awardBadges = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;
    // Example: Badge for 25+ problems solved
    const badge25 = await Badge.findOne({ name: '25 Problems Solved' });
    if (user.problemSolved.length >= 25 && badge25 && !user.badges.includes(badge25._id)) {
        user.badges.push(badge25._id);
    }
    // Example: Badge for 50+ active days (login days)
    const badge50 = await Badge.findOne({ name: '50 Active Days' });
    // For demo, assume user has a field user.activeDays (array of dates)
    if (user.activeDays && user.activeDays.length >= 50 && badge50 && !user.badges.includes(badge50._id)) {
        user.badges.push(badge50._id);
    }
    await user.save();
};

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'username profilePic');
    return res.status(200).json(new ApiResponse(200, notifications, 'User notifications'));
});

const markNotificationRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: req.user._id },
        { read: true },
        { new: true }
    );
    if (!notification) throw new ApiError(404, 'Notification not found');
    return res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export { registerUser, loginUser, logoutUser, updateAccountDetails, updateUserAvatar, getUserProfile, followUser, unfollowUser, getConnections, sendConnectionRequest, acceptConnectionRequest, removeConnection, searchUsers, getUserBadges, getNotifications, markNotificationRead };