import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Sales User";
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILead extends Document {
  name: string;
  email: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  source: "Website" | "Instagram" | "Referral";
  createdAt: Date;
  updatedAt: Date;
}

// Custom request interface to support authenticated routes
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "Admin" | "Sales User";
        email: string;
        name: string;
      };
    }
  }
}
