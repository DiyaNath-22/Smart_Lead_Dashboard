import { Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/appError.js";
import { verifyToken } from "../services/auth.service.js";
import User from "../models/User.js";

/**
 * Authentication check middleware
 */
export const protect = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = "";
    
    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("You are not logged in. Please log in to gain access.");
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired token. Please log in again.");
    }

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError("The user belonging to this token no longer exists.");
    }

    // Grant access and assign to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization role restriction middleware
 */
export const restrictTo = (...roles: Array<"Admin" | "Sales User">) => {
  return (req: any, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ForbiddenError("You do not have permission to perform this action."));
      return;
    }
    next();
  };
};
