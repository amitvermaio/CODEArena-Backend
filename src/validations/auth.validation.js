import { body } from 'express-validator';

export const registerValidation = [
    body('email').trim().isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('username', 'Username is required and must be alphanumeric').isAlphanumeric().trim().escape(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

export const loginValidation = [
  // Custom validator to ensure that either email or username is present.
  body().custom((value, { req }) => {
    const { email, username } = req.body;
    if ((!email || email.trim() === '') && (!username || username.trim() === '')) {
      throw new Error('Either email or username is required');
    }
    return true;
  }),

  // If email is provided, it must be a valid email. This is more robust than a custom regex.
  body('email')
    .optional({ checkFalsy: true }) // Skips validation if field is falsy (e.g., '', null)
    .isEmail().withMessage('Please include a valid email')
    .normalizeEmail(),

  // Password is always required.
  body('password', 'Password is required').notEmpty(),
];