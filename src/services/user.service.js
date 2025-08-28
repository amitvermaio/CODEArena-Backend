import { User } from '../models/user/user.model.js';

export const getUserProfileService = async (username) => {
    try {
        const user = await User.findOne({ username }).select('-email -refreshToken -isActive -isDeleted'); 
        return user;
    } catch (error) {
        // Handle potential database errors
        throw new Error(`Error fetching user profile: ${error.message}`);
    }
};

export const validateUpdationFields = async () => {
    if (!fullName && !bio && !location && !skills && !socialLinks && !website && !profileColor) {
        throw new ApiError(400, "At least one field to update is required");
    }
    if (skills && !Array.isArray(skills)) {  }
    if (socialLinks && typeof socialLinks !== 'object') {  }
    if (profileColor) {
        const allowedColors = [];
        if (!allowedColors.includes(profileColor)) {
            throw new ApiError(400, "Invalid profile color");
        }
    }

}