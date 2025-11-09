import jwt from "jsonwebtoken";
import { User } from "../models/user/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import blacklistTokenModel from "../models/user/blacklistToken.model.js";

export const protect = asyncHandler(async (req, _, next) => {
  console.log(req.cookies?.['CA_AUTH_TOKEN']);
  console.log("===============================================")
  console.log("===============================================\n")
  
  console.log(req.headers.authorization);
  const token =
    req.cookies?.['CA_AUTH_TOKEN'] ||
    req.headers.authorization?.split(" ")[1];
    

  if (!token) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, "Unauthorized request: Session Expired");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password +role +isDeleted"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    if (user.isDeleted) {
      throw new ApiError(
        403,
        "This account has been deactivated. Contact admin."
      );
    }

    if (user.status === "banned") {
      throw new ApiError(403, "Access Denied: This account has been banned.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Access token expired. Please refresh your token."
      );
    }
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
