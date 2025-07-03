import { body } from 'express-validator';

export const registerValidation = [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('username', 'Username is required and must be alphanumeric').isAlphanumeric().trim().escape(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

export const loginValidation = [
  body().custom((value, { req }) => {
    if ((!req.body.email || req.body.email.trim() === '') && (!req.body.username || req.body.username.trim() === '')) {
      throw new Error('Either email or username is required');
    }
    if (req.body.email && req.body.email.trim() !== '') {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        throw new Error('Please include a valid email');
      }
    }
    if (!req.body.password || req.body.password.trim() === '') {
      throw new Error('Password is required');
    }
    return true;
  }),
];