import { User } from '../models/user/user.model.js';
import { registerUserService, loginUserService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

import '../config/passport.config.js';


// Cookie options for security
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
};

const generateAndSetTokens = async (res, user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove sensitive data from user object before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }) // 15 mins
       .cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

    return userResponse;
};

// Controller for local registration
export const registerUser = asyncHandler(async (req, res) => {
    const user = await registerUserService(req.body);
    const userResponse = await generateAndSetTokens(res, user);

    return res.status(201).json(new ApiResponse(201, userResponse, "User registered successfully"));
});

// Controller for successful local login (actual auth is in middleware)
export const loginSuccess = (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, "Login successful"));
};

// Controller for local login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUserService({ email, username, password });
    
    // Set cookies
    res.cookie(process.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
       .cookie(process.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    return res.status(200).json(new ApiResponse(200, user, "User logged in successfully"));
});

// Controller for login failure (actual auth is in middleware)
export const loginFailure = (req, res) => {
    // Passport flash messages can be used here if you set it up
    res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
};

// This is the callback for all successful OAuth logins
export const oauthCallback = (req, res) => {
    // Redirect to your frontend dashboard or home page
    res.redirect(`${process.env.CORS_ORIGIN}/dashboard`);
};

// Controller for getting the current user's data
export const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the auth middleware
    return res.status(200).json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

// Controller for logging out
export const logoutUser = asyncHandler(async (req, res) => {
    // Invalidate the refresh token in the database
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } }, // removes the field
        { new: true }
    );

    // Clear cookies
    res.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME, cookieOptions)
       .clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME, cookieOptions);

    return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies[process.env.REFRESH_TOKEN_COOKIE_NAME];

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const userResponse = await generateAndSetTokens(res, user);
    
    return res.status(200).json(new ApiResponse(200, { user: userResponse }, "Access token refreshed"));
});