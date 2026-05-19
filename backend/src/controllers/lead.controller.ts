import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/appError.js";
import * as leadService from "../services/lead.service.js";

/**
 * Get paginated, sorted, and filtered leads directory
 */
export const getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const source = req.query.source as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await leadService.getLeads({
      status,
      source,
      search,
      sort,
      page,
      limit
    });

    res.status(200).json({
      status: "success",
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single lead details by Mongoose ID
 */
export const getLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    if (!lead) {
      throw new NotFoundError("No lead found with the provided ID.");
    }

    res.status(200).json({
      status: "success",
      data: { lead }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead record
 */
export const createLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await leadService.createLead(req.body);
    res.status(201).json({
      status: "success",
      message: "Lead created successfully",
      data: { lead }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing lead record
 */
export const updateLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await leadService.updateLead(id, req.body);

    if (!lead) {
      throw new NotFoundError("No lead found with the provided ID.");
    }

    res.status(200).json({
      status: "success",
      message: "Lead updated successfully",
      data: { lead }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead record
 */
export const deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await leadService.deleteLead(id);

    if (!lead) {
      throw new NotFoundError("No lead found with the provided ID.");
    }

    res.status(200).json({
      status: "success",
      message: "Lead deleted successfully",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export filtered leads into CSV download attachment format
 */
export const exportLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const source = req.query.source as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;

    // Fetch all records matching conditions (ignores pagination limit)
    const leads = await leadService.getAllLeadsForExport({ status, source, search, sort });
    
    // Generate CSV string content
    const csvData = leadService.convertLeadsToCSV(leads);

    // Set Response Headers for attachment downloading
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=smart-leads-export.csv");
    
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
