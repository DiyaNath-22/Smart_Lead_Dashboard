import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Validates request payload and formats error lists uniformly
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => `${err.msg}`);
    
    res.status(400).json({
      status: "fail",
      message: "Validation Error",
      errors: errorMessages,
    });
    return;
  }
  next();
};
