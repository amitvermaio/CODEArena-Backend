import { User } from "../models/user/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUserService = async (userData) => {
  const { fullname, username, email, password } = userData;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    fullname,
    username,
    email,
    password,
  });

  if (!user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const token = await user.generateToken();

  return { user, token };
};

export const loginUserService = async ({ email, username, password }) => {
  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  }).select("+password +isDeleted");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isDeleted === true) {
    throw new ApiError(403, "User account is deactivated. Contact Support.");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = await user.generateToken();
  const userData = user.toObject();
  delete userData.password;
  delete userData.isDeleted;

  return { user: userData, token };
};
