import { User } from '../models/user/user.model.js'; 
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js'; 
import { ApiError } from '../utils/ApiError.js';

export const registerUserService = async (userData) => {
    const { username, email, password } = userData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    if (!user) { 
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    
    return user; 
};

export const loginUserService = async ({ email, username, password }) => {
    const user = await User.findOne(email ? { email } : { username }).select('+password');
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return { user: userResponse, accessToken, refreshToken };
};