import {
  registerUserService,
  loginUserService,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import BlacklistToken from "../models/user/blacklistToken.model.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { user, token } = await registerUserService(req.body);
  const userData = user.toObject();
  delete userData.password;
  delete user.status

  res.cookie("CA_AUTH_TOKEN", token, {
    httpOnly: true,
    secure: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { user: userData, token }, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username required!");
  }

  const { user, token } = await loginUserService({
    email,
    username,
    password,
  });

  res.cookie("CA_AUTH_TOKEN", token, {
    httpOnly: true,
    secure: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "User logged in successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  console.log(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  const cookieToken = req.cookies?.CA_AUTH_TOKEN;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

  if (!token) {
    throw new ApiError(400, "No active session found");
  }

  res.clearCookie("CA_AUTH_TOKEN", {
    httpOnly: true,
    secure: true,
  });

  await BlacklistToken.create({ token });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Send Password Reset OTP
export const passwordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return;
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const otp = generateOTP();

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Welcome to CodeArena! ${user.email}\n Please Verify your account to reset your password your OTP is ${otp}`,
      html: generatePasswordResetOTPEmail(user.email, otp),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isDeleted = true;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User deleted successfully"));
});

export const googleAuthSuccess = asyncHandler(async (req, res) => {
  try {
    const googleEmail = req.user.emails[0].value;
    const googleId = req.user.id;
    const fullname = req.user.displayName;
    const avatar = req.user.photos[0]?.value || "";

    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      // Generate username automatically
      const generatedUsername = googleEmail.split("@")[0] + "_" + Date.now().toString().slice(-4);

      user = await User.create({
        username: generatedUsername,
        email: googleEmail,
        fullname,
        avatar,
        googleId,
        password: null, // because OAuth user
        isEmailVerified: true,
      });
    }

    // Generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    res.cookie("CA_AUTH_TOKEN", token, {
      httpOnly: true,
      secure: true,
    });
    
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL;

    return res.redirect(`${frontendBaseUrl}/problems`);
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});