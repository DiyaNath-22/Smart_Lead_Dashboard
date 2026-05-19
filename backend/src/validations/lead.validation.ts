import { body } from "express-validator";

export const createLeadValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Lead name is required")
    .isLength({ min: 2 })
    .withMessage("Lead name must be at least 2 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Lead email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["New", "Contacted", "Qualified", "Lost"])
    .withMessage("Status must be New, Contacted, Qualified, or Lost"),
  body("source")
    .trim()
    .notEmpty()
    .withMessage("Source is required")
    .isIn(["Website", "Instagram", "Referral"])
    .withMessage("Source must be Website, Instagram, or Referral"),
];

export const updateLeadValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Lead name must be at least 2 characters long"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("status")
    .optional()
    .trim()
    .isIn(["New", "Contacted", "Qualified", "Lost"])
    .withMessage("Status must be New, Contacted, Qualified, or Lost"),
  body("source")
    .optional()
    .trim()
    .isIn(["Website", "Instagram", "Referral"])
    .withMessage("Source must be Website, Instagram, or Referral"),
];
