import jwt from 'jsonwebtoken';
import { User } from '../models/user/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.[process.env.ACCESS_TOKEN_COOKIE_NAME] ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id)
      .select("-password +role +isDeleted");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    if (user.isDeleted) {
      throw new ApiError(403, "This account has been deactivated. Contact admin.");
    }

    if (user.status === "banned") {
      throw new ApiError(403, "Access Denied: This account has been banned.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired. Please refresh your token.");
    }
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
