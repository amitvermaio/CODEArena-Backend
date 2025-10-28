import { body } from "express-validator";

export const registerValidation = [
  body("fullname")
    .notEmpty()
    .withMessage("Fullname is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Fullname must be between 3 and 20 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Please enter a password with 6 or more characters"),
];

export const loginValidation = [

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];
