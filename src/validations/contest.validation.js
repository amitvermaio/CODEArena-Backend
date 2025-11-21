import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const createContestValidation = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .isISO8601().withMessage("Start time must be a valid date"),

  body("duration")
    .notEmpty().withMessage("Duration is required")
    .matches(/^\d+h$/).withMessage("Duration must be like '1h', '2h', '24h'"),

  // frontend sends JSON.stringified array → validate accordingly
  body("problems")
    .notEmpty().withMessage("Problems are required")
    .custom(value => {
      let arr;
      try {
        arr = JSON.parse(value);
      } catch {
        throw new Error("Problems must be valid JSON");
      }
      if (!Array.isArray(arr)) throw new Error("Problems must be an array");
      if (!arr.every(id => typeof id === "string")) {
        throw new Error("Each problem must be a string ID");
      }
      return true;
    }),

  // Image is handled by multer → no validation needed here
];


export const updateContestValidation = (req, res, next) => {
  const allowedUpdates = [
    "title",
    "description",
    "coverImage",
    "startTime",
    "status",
    "duration",
    "problems",
  ];

  const invalidFields = Object.keys(req.body).filter(
    key => !allowedUpdates.includes(key)
  );

  if (invalidFields.length) {
    throw new ApiError(
      400,
      `Invalid fields in update: ${invalidFields.join(", ")}`
    );
  }

  next();
};

export const handleContestValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
