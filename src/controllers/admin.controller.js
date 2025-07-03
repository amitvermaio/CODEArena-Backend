import { User } from '../models/user/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const changeUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;

    if (!['user', 'admin'].includes(newRole)) {
        throw new ApiError(400, 'Invalid role specified');
    }

    // Use `overwriteImmutable: true` to bypass the schema restriction.
    // This should ONLY be available in an admin-protected route.
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role: newRole },
        { new: true, overwriteImmutable: true }
    );

    if (!updatedUser) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(new ApiResponse(200, { userId: updatedUser._id, newRole: updatedUser.role }, "User role updated successfully"));
});
