import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { join } from "path";
import passport from "./src/config/passport.js";

import connectDB from "./src/config/db.js";
// import { initializePassport } from './src/config/passport.config.js';

import mainApiRouter from "./src/routes/routes.js";
import { ApiError } from "./src/utils/ApiError.js";

const app = express();
const __dirname = import.meta.dirname;
const PORT = process.env.PORT || 8080;

// Cors Middleware
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "public")));
app.use(cookieParser());
app.use(passport.initialize());

// --- Content Security Policy (CSP) Middleware ---
// This sets a security policy to prevent common attacks.
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self';" + // Only allow resources from our own domain by default
//       "script-src 'self';" + // Allow scripts from our domain
//       "style-src 'self';" + // Allow styles from our domain
//       "img-src 'self' data:;" // Allow images from our domain and data URIs
//     // "script-src 'self' 'unsafe-inline';" + // Remove or comment out unsafe-inline for better security
//     // "style-src 'self' 'unsafe-inline';" +  // Remove or comment out unsafe-inline for better security
//   );
//   next();
// });

// API Routes
app.use("/api/v1", mainApiRouter);

// Handle favicon requests to prevent 404 errors and the strict default CSP
app.get("/favicon.ico", (req, res) => res.status(204).send());
app.get("/", (req, res) => res.send("API is running..."));

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  } else {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      errors: [err.message],
      data: null,
    });
  }
});

app.listen(PORT, async () => {
  await connectDB();
});