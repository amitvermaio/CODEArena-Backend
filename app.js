import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { join } from "path";

import connectDB from './src/config/db.js';
import { initializePassport } from './src/config/passport.config.js';

import mainApiRouter from './src/routes/routes.js';
import { ApiResponse } from './src/utils/ApiResponse.js';
import { ApiError } from './src/utils/ApiError.js';

dotenv.config();
initializePassport(passport); 

const app = express();
const __dirname = import.meta.dirname; 
const PORT = process.env.PORT || 3000;

// Cors Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static(join(__dirname, 'public')));
app.use(cookieParser());

// --- Session Middleware ---
// Must come BEFORE passport middleware
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if unmodified
    saveUninitialized: true, // Changed to true to help with unauthenticated sessions
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions' 
    }),
    cookie: {
        maxAge: THIRTY_DAYS,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, // Add httpOnly attribute for security
        sameSite: 'strict', // Add sameSite attribute for security
    }
}));

// --- Passport Middleware ---
app.use(passport.initialize());
app.use(passport.session()); 

// --- Content Security Policy (CSP) Middleware ---
// This sets a security policy to prevent common attacks.
app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self';" + // Only allow resources from our own domain by default
      "script-src 'self';" + // Allow scripts from our domain
      "style-src 'self';" + // Allow styles from our domain
      "img-src 'self' data:;" // Allow images from our domain and data URIs
      // "script-src 'self' 'unsafe-inline';" + // Remove or comment out unsafe-inline for better security
      // "style-src 'self' 'unsafe-inline';" +  // Remove or comment out unsafe-inline for better security
  );
    next();
});

// View engine setup
app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

// API Routes
app.use('/api/v1', mainApiRouter);

// --- Page Rendering Routes ---
// These routes render the .pug files for the user to see in the browser.

// Handle favicon requests to prevent 404 errors and the strict default CSP
app.get('/favicon.ico', (req, res) => res.status(204).send());

// Home/Feed page
app.get("/", (req, res) => res.render("feed", { title: "Feed" }));

// Login page
app.get("/login", (req, res) => res.render("login", { title: "Login" }));

// Register page
app.get("/register", (req, res) => res.render("register", { title: "Register" }));

// Problems page
app.get("/problems", (req, res) => res.render("problems", { title: "Problems" }));

// Single Problem page 
app.get("/problems/:slug", (req, res) => {
    // In a real app, fetch problem data from your database using the slug
    const problem = {
        id: req.params.slug,
        title: "Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`."
    };
    res.render("problem-detail", { title: problem.title, problem: problem });
});

// Contests page
app.get("/contests", (req, res) => res.render("contests", { title: "Contests" }));

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    } else {
        console.error(err); 
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [err.message],
            data: null
        });
    }
});


app.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running at http://localhost:${PORT}`);
});