import jwt from 'jsonwebtoken';
import { User } from '../models/user/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// This is the primary middleware for protecting routes.
// It verifies the JWT from the cookie and attaches the user to the request.
export const protect = asyncHandler(async (req, _, next) => {
    // Allow token to be sent in cookie or as a Bearer token in the Authorization header
    const token = req.cookies?.[process.env.ACCESS_TOKEN_COOKIE_NAME] || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request: No token provided");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select('-password');

        if (!user) {
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        // Optional: Check if the user is banned or deactivated
        if (user.isBanned) {
            throw new ApiError(403, "Access Denied: This account has been banned.");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "Access token expired. Please refresh your token.");
        }
        // For other JWT errors (e.g., malformed token, invalid signature)
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

// Middleware to check for admin role.
// This should be used *after* the `protect` middleware in routes.
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    // Using ApiError for consistency, which will be handled by the global error handler.
    throw new ApiError(403, "Forbidden: You do not have admin privileges.");
};


/*
// =================================================================
// FUTURE PASSPORT.JS IMPLEMENTATION 
//
// When you switch to Passport.js, you would replace the `protect`
// middleware above with something like this.
//
// You would also need to configure the JWT strategy in your passport.config.js
//
// ----------------- passport.config.js -----------------
//
// import passport from 'passport';
// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import { User } from './models/user/user.model.js';
//
// const cookieExtractor = (req) => {
//   let token = null;
//   if (req && req.cookies) {
//     token = req.cookies[process.env.ACCESS_TOKEN_COOKIE_NAME];
//   }
//   return token;
// };
//
// const options = {
//   jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
//   secretOrKey: process.env.ACCESS_TOKEN_SECRET,
// };
//
// passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
//   try {
//     const user = await User.findById(jwt_payload._id).select('-password');
//     if (user) {
//       return done(null, user);
//     } else {
//       return done(null, false);
//     }
//   } catch (error) {
//     return done(error, false);
//   }
// }));
//
// ----------------- auth.middleware.js (Passport version) -----------------
//
// import passport from 'passport';
// import { ApiError } from '../utils/ApiError.js';
//
// export const protect = (req, res, next) => {
//   passport.authenticate('jwt', { session: false }, (err, user, info) => {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//        const message = info?.message || "Unauthorized: You must be logged in to access this resource.";
//        return next(new ApiError(401, message));
//     }
//     req.user = user;
//     return next();
//   })(req, res, next);
// };
//
// =================================================================
*/