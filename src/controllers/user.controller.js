import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user/user.model.js";
import { uploadFile, deleteFile } from "../utils/ImageKit.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Badge from "../models/user/badge.model.js";
import Notification from "../models/platform/notification.model.js";

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const {
    fullName,
    bio,
    location,
    skills,
    socialLinks,
    website,
    profileColor,
  } = req.body;

  try {
    if (
      !fullName &&
      !bio &&
      !location &&
      !skills &&
      !socialLinks &&
      !website &&
      !profileColor
    ) {
      throw new ApiError(400, "At least one field to update is required");
    }

    const updateFields = {};

    if (fullName !== undefined) updateFields.fullName = fullName;
    if (bio !== undefined) updateFields.bio = bio;
    if (location !== undefined) updateFields.location = location;
    if (skills !== undefined) updateFields.skills = skills;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;
    if (website !== undefined) updateFields.website = website;
    if (profileColor !== undefined) updateFields.profileColor = profileColor;

    console.log(updateFields);
    if (skills && !Array.isArray(skills)) {
      throw new ApiError(400, "Skills must be an array");
    }

    if (socialLinks && typeof socialLinks !== "object") {
      throw new ApiError(400, "Social links must be an object");
    }

    if (profileColor) {
      const allowedColors = [
        "default",
        "blue",
        "green",
        "purple",
        "red",
        "orange",
        "yellow",
        "pink",
        "slate",
        "stone",
        "indigo",
        "cyan",
      ];
      if (!allowedColors.includes(profileColor)) {
        throw new ApiError(400, "Invalid profile color");
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("User: ", user);

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadFile(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  const user = await User.findOne({ username }).select(
    "-password"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Here you would also fetch user's posts, problems solved, contest history etc.
  // For now, we just return the user object.

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === "")
    return res.status(200).json(new ApiResponse(200, [], "No search query"));
  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { fullName: { $regex: q, $options: "i" } },
    ],
  }).select("username fullName profilePic");
  return res
    .status(200)
    .json(new ApiResponse(200, users, "User search results"));
});

export const getUserBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId || req.user._id).populate(
    "badges"
  );
  return res.status(200).json(new ApiResponse(200, user.badges, "User badges"));
});

// Award badges based on activity (call after login or problem submission)
export const awardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  // Example: Badge for 25+ problems solved
  const badge25 = await Badge.findOne({ name: "25 Problems Solved" });
  if (
    user.problemSolved.length >= 25 &&
    badge25 &&
    !user.badges.includes(badge25._id)
  ) {
    user.badges.push(badge25._id);
  }
  // Example: Badge for 50+ active days (login days)
  const badge50 = await Badge.findOne({ name: "50 Active Days" });
  // For demo, assume user has a field user.activeDays (array of dates)
  if (
    user.activeDays &&
    user.activeDays.length >= 50 &&
    badge50 &&
    !user.badges.includes(badge50._id)
  ) {
    user.badges.push(badge50._id);
  }
  await user.save();
};

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sender", "username profilePic");
  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "User notifications"));
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

/* =============================
    ADMIN CONTROLLER FNS
============================= */

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("+status +role");
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  if (!["user", "admin"].includes(newRole)) {
    throw new ApiError(400, "Invalid role specified");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, overwriteImmutable: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: updatedUser._id, newRole: updatedUser.role },
        "User role updated successfully"
      )
    );
});

export const changeUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // e.g. "active" | "banned"

  if (!["active", "banned"].includes(status)) {
    throw new ApiError(400, "Invalid status specified");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, overwriteImmutable: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { userId: updatedUser._id, status: updatedUser.status },
        "User status updated successfully"
      )
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true, overwriteImmutable: true }
  );
  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});
