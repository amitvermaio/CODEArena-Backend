import { User } from '../models/user/user.model.js';
import { registerUserService, loginUserService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

import '../config/passport.config.js';
import { ApiError } from '../utils/ApiError.js';


// Cookie options for security
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
};

const generateAndSetTokens = async (res, user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log('Generated new access token:', accessToken ? 'SUCCESS' : 'FAILED');
    // console.log('Generated new refresh token:', refreshToken ? 'SUCCESS' : 'FAILED');

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data from user object before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins
       .cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    // console.log('Cookies set successfully');
    return userResponse;
};

export const registerUser = asyncHandler(async (req, res) => {
    const user = await registerUserService(req.body);
    const userResponse = await generateAndSetTokens(res, user);

    return res.status(201).json(new ApiResponse(201, userResponse, "User registered successfully"));
});

export const loginSuccess = (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Login successful"));
};

export const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const { user, accessToken, refreshToken } = await loginUserService({ email, username, password });
        
        res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
        .cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        
        return res.status(200).json(new ApiResponse(200, user, "User logged in successfully"));
    } catch (error) {
        throw new ApiError(404, "Email or username required!", error.message);
    }
});

// Controller for login failure (actual auth is in middleware)
export const loginFailure = (req, res) => {
    // Passport flash messages can be used here if you set it up
    res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
};


export const oauthCallback = (req, res) => {
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard`);
};

export const getMe = asyncHandler(async (req, res) => {
    console.log(req.user);
    return res.status(200).json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: undefined } }, // removes the field
        { new: true }
    );

    // Clear cookies
    res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME, cookieOptions)
       .clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME];
    // console.log('Refresh token from cookie:', incomingRefreshToken ? 'EXISTS' : 'MISSING');
    // console.log('All cookies:', req.cookies);
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select('+refreshToken');

    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const userResponse = await generateAndSetTokens(res, user);
    // console.log('Token refresh completed successfully');
    return res.status(200).json(new ApiResponse(200, { user: userResponse }, "Access token refreshed"));
});


// Send Password Reset OTP
export const passwordResetOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return 
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({success: false, error: "User not found" });
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
      html: generatePasswordResetOTPEmail(user.email, otp)
    }

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({success: false, error: error.message });
  }
}