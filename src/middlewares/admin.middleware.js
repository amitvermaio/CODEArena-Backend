import { ApiError } from "../utils/ApiError.js";

const admin = (req, res, next) => {
    console.log(req.user)
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    throw new ApiError(403, "Forbidden: You do not have admin privileges.");
};

export { admin };