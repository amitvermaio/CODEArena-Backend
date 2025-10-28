import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/ApiResponse.js";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  console.log(req.body);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, errors.array()[0].msg));
  }
  next();
};
