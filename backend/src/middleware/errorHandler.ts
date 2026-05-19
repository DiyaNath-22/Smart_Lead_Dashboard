import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    error = new AppError(`Invalid field resource format: ${err.path}`, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    error = new AppError(`Duplicate field value entered: ${value}. Please use another value.`, 400);
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    error = new AppError(`Validation Failure: ${messages.join(". ")}`, 400);
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid credentials token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Credentials token has expired. Please log in again.", 401);
  }

  const statusCode = error.statusCode || 500;
  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

  res.status(statusCode).json({
    status,
    message: error.message || "Internal Server Error",
    // Only output stack trace in development mode
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
