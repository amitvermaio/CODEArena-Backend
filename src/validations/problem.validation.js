import { body, validationResult } from 'express-validator';

export const createProblemValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must be at most 100 characters'),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array of strings'),
];

// validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};