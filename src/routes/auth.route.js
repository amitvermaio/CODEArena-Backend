import express from 'express';
import passport from 'passport';
import { registerValidation, loginValidation } from '../validations/auth.validation.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
    registerUser,
    loginUser,
    loginSuccess,
    loginFailure,
    oauthCallback,
    getMe,
    logoutUser
} from '../controllers/auth.controller.js';

const router = express.Router();

// --- Local Authentication ---
// @route   POST api/auth/register
router.post('/register', registerValidation, handleValidationErrors, registerUser);

// Custom login with email/username and password
router.post('/login', loginValidation, handleValidationErrors, loginUser);

// Passport login (optional)
router.post('/login/passport',
    passport.authenticate('local', { failureRedirect: '/api/auth/login-failure' }),
    loginSuccess
);

// @route   GET api/auth/login-failure (helper route)
router.get('/login-failure', loginFailure);

// --- Google OAuth ---
// @route   GET api/auth/google (Kicks off the authentication process)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback (Google redirects here after login)
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }), // Redirect to frontend home on failure
    oauthCallback
);

// --- GitHub OAuth ---
// @route   GET api/auth/github
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET api/auth/github/callback
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    oauthCallback
);

// --- GitHub OAuth ---
// @route   GET api/auth/linkedin
router.get('/linkedin', passport.authenticate('linkedin'));

// @route   GET api/auth/github/callback
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    oauthCallback
)

// --- Session Management ---
// @route   GET api/auth/me (Check login status and get user data)
router.get('/me', protect, getMe);

// @route   POST api/auth/logout
router.post('/logout', protect, logoutUser);

export default router;