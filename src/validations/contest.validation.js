import { body, validationResult } from "express-validator";

export const createContestValidation = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .isISO8601().withMessage("Start time must be a valid date"),

  body("endTime")
    .notEmpty().withMessage("End time is required")
    .isISO8601().withMessage("End time must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("registrationDeadline")
    .optional()
    .isISO8601().withMessage("Registration deadline must be a valid date")
    .custom((value, { req }) => {
      if (req.body.startTime && new Date(value) > new Date(req.body.startTime)) {
        throw new Error("Registration deadline must be before contest start time");
      }
      return true;
    }),

  body("visibility")
    .optional()
    .isIn(["Public", "Private"]).withMessage("Visibility must be either Public or Private"),

  body("maxParticipants")
    .optional()
    .isInt({ min: 1 }).withMessage("Max participants must be a positive integer"),

  body("problems")
    .optional()
    .isArray().withMessage("Problems must be an array of IDs")
    .custom((arr) => arr.every((id) => typeof id === "string"))
    .withMessage("Each problem must be a string (MongoDB ObjectId)"),

  body("registrants")
    .optional()
    .isArray().withMessage("Registrants must be an array of IDs")
    .custom((arr) => arr.every((id) => typeof id === "string"))
    .withMessage("Each registrant must be a string (MongoDB ObjectId)"),
];


export const handleContestValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
