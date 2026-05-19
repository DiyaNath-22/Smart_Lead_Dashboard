import { Schema, model } from "mongoose";
import { ILead } from "../types/index.js";

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Lead email is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["Website", "Instagram", "Referral"],
      default: "Website",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // generates createdAt and updatedAt automatically
  }
);

// Explicit index on createdAt for sorting filters
leadSchema.index({ createdAt: -1 });
// Compound search index for filtering combining multiple dimensions
leadSchema.index({ status: 1, source: 1 });

export const Lead = model<ILead>("Lead", leadSchema);
export default Lead;
