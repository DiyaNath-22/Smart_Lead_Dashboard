import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { BadRequestError, UnauthorizedError } from "../utils/appError.js";
import { generateToken } from "../services/auth.service.js";

/**
 * Handle user registration
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("This email address is already registered.");
    }

    // Create new user (password is automatically hashed in schema pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "Sales User",
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    res.status(201).json({
      status: "success",
      message: "Registration completed successfully",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Fetch user and include password field for comparison
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password credentials.");
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password credentials.");
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch currently authenticated user profile info
 */
export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Session expired or user logged out.");
    }

    res.status(200).json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};
