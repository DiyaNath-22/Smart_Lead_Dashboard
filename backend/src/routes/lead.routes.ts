import { Router } from "express";
import * as leadController from "../controllers/lead.controller.js";
import { createLeadValidation, updateLeadValidation } from "../validations/lead.validation.js";
import { handleValidationErrors } from "../middleware/validation.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

// Apply auth protection globally to all leads endpoints
router.use(protect);

// CSV Export route
router.get("/export", leadController.exportLeads);

// Retrieve leads & Create lead routes
router.route("/")
  .get(leadController.getLeads)
  .post(
    restrictTo("Admin", "Sales User"),
    createLeadValidation,
    handleValidationErrors,
    leadController.createLead
  );

// Individual lead routes
router.route("/:id")
  .get(leadController.getLead)
  .patch(
    restrictTo("Admin", "Sales User"),
    updateLeadValidation,
    handleValidationErrors,
    leadController.updateLead
  )
  .delete(
    restrictTo("Admin"), // Demonstrate RBAC: Only Admin accounts can delete leads
    leadController.deleteLead
  );

export default router;
