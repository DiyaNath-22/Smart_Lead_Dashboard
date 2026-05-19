import Lead from "../models/Lead.js";
import { ILead } from "../types/index.js";

interface GetLeadsParams {
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
  page: number;
  limit: number;
}

interface PaginatedLeads {
  leads: ILead[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Fetch and filter leads with pagination and sorting
 */
export const getLeads = async (params: GetLeadsParams): Promise<PaginatedLeads> => {
  const { status, source, search, sort, page, limit } = params;

  // Build MongoDB query
  const query: any = {};

  if (status && status !== "All") {
    query.status = status;
  }

  if (source && source !== "All") {
    query.source = source;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  // Sorting option
  let sortOption: any = { createdAt: -1 }; // default: newest
  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "name-asc") {
    sortOption = { name: 1 };
  }

  const total = await Lead.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  const leads = await Lead.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    leads,
    metadata: {
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Fetch all matching leads without pagination for CSV Export
 */
export const getAllLeadsForExport = async (params: Omit<GetLeadsParams, "page" | "limit">): Promise<ILead[]> => {
  const { status, source, search, sort } = params;
  const query: any = {};

  if (status && status !== "All") {
    query.status = status;
  }

  if (source && source !== "All") {
    query.source = source;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  let sortOption: any = { createdAt: -1 };
  if (sort === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sort === "name-asc") {
    sortOption = { name: 1 };
  }

  return Lead.find(query).sort(sortOption);
};

/**
 * Convert leads array to CSV String
 */
export const convertLeadsToCSV = (leads: ILead[]): string => {
  const headers = ["Name", "Email", "Status", "Source", "Created At"];
  const rows = leads.map(lead => {
    const escapedName = (lead.name || "").replace(/"/g, '""');
    const escapedEmail = (lead.email || "").replace(/"/g, '""');
    return `"${escapedName}","${escapedEmail}","${lead.status}","${lead.source}","${lead.createdAt.toISOString()}"`;
  });
  
  return [headers.join(","), ...rows].join("\n");
};

/**
 * CRUD functions
 */
export const getLeadById = async (id: string): Promise<ILead | null> => {
  return Lead.findById(id);
};

export const createLead = async (leadData: Partial<ILead>): Promise<ILead> => {
  const lead = new Lead(leadData);
  return lead.save();
};

export const updateLead = async (id: string, updateData: Partial<ILead>): Promise<ILead | null> => {
  return Lead.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

export const deleteLead = async (id: string): Promise<ILead | null> => {
  return Lead.findByIdAndDelete(id);
};
