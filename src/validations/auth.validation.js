import { body } from "express-validator";

export const registerValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),
  body("username", "Username is required and must be alphanumeric")
    .isAlphanumeric()
    .trim()
    .escape(),
  body(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
];

export const loginValidation = [
  body().custom((value, { req }) => {
    const { email, username } = req.body;
    // console.log(email);
    if (
      (!email || email.trim() === "") &&
      (!username || username.trim() === "")
    ) {
      throw new Error("Either email or username is required");
    }
    return true;
  }),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please include a valid email")
    .normalizeEmail(),

  body("password", "Password is required").notEmpty(),
];
