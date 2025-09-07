import { body, validationResult } from "express-validator";

export const createProblemValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("statement").notEmpty().withMessage("Statement is required"),

  body("difficulty")
    .notEmpty()
    .withMessage("Difficulty is Required")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be either Easy, Medium, or Hard"),

  body("constraints").notEmpty().withMessage("Constraints are required"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((arr) => arr.every((tag) => typeof tag === "string"))
    .withMessage("Tags must be an array of non-empty strings"),

  body("timeLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Time Limit Must be a Positive Number"),

  body("memoryLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Memory limit must be a positive integer"),
];

export const updateProblemValidation = [
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("statement")
    .optional()
    .notEmpty()
    .withMessage("Statement cannot be empty"),

  body("difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be either Easy, Medium, or Hard"),

  body("constraints")
    .optional()
    .notEmpty()
    .withMessage("Constraints cannot be empty"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((arr) =>
      arr.every((tag) => typeof tag === "string" && tag.trim() !== "")
    )
    .withMessage("Tags must be an array of non-empty strings"),

  body("timeLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Time Limit must be a positive integer"),

  body("memoryLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Memory Limit must be a positive integer"),
];

export const handleProblemsValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
