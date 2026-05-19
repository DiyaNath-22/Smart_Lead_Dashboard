import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ChevronLeft, Save, Loader2, Sparkles } from "lucide-react";
import apiClient from "../api/client.js";
import { Lead } from "../types/index.js";
import { Input, Select } from "../components/Input.js";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Lead contact name must be at least 2 characters long"),
  email: z.string().trim().email("Please enter a valid email address"),
  status: z.enum(["New", "Contacted", "Qualified", "Lost"], {
    errorMap: () => ({ message: "Please select a valid stage status" }),
  }),
  source: z.enum(["Website", "Instagram", "Referral"], {
    errorMap: () => ({ message: "Please select a valid sourcing channel" }),
  }),
});

type LeadFormFields = z.infer<typeof leadSchema>;

export const LeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormFields>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      status: "New",
      source: "Website",
    },
  });

  // Query lead details if editing
  const { data: leadData, isLoading: isLoadingLead } = useQuery<Lead>({
    queryKey: ["lead-form-details", id],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${id}`);
      return res.data.data.lead;
    },
    enabled: isEditMode,
  });

  // Populate form fields on details loaded
  useEffect(() => {
    if (leadData) {
      reset({
        name: leadData.name,
        email: leadData.email,
        status: leadData.status,
        source: leadData.source,
      });
    }
  }, [leadData, reset]);

  // Create Lead mutation
  const createMutation = useMutation({
    mutationFn: async (data: LeadFormFields) => {
      await apiClient.post("/leads", data);
    },
    onSuccess: () => {
      toast.success("Sales lead added successfully.");
      navigate("/leads");
    },
    onError: (err: any) => {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to create sales lead.";
      toast.error(errMsg);
    },
  });

  // Update Lead mutation
  const updateMutation = useMutation({
    mutationFn: async (data: LeadFormFields) => {
      await apiClient.patch(`/leads/${id}`, data);
    },
    onSuccess: () => {
      toast.success("Lead details updated successfully.");
      navigate("/leads");
    },
    onError: (err: any) => {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to update lead details.";
      toast.error(errMsg);
    },
  });

  const onSubmit = async (data: LeadFormFields) => {
    setIsSubmitting(true);
    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
    setIsSubmitting(false);
  };

  const statusOptions = [
    { label: "New Lead", value: "New" },
    { label: "Contacted", value: "Contacted" },
    { label: "Qualified", value: "Qualified" },
    { label: "Lost Opportunity", value: "Lost" },
  ];

  const sourceOptions = [
    { label: "Website", value: "Website" },
    { label: "Instagram", value: "Instagram" },
    { label: "Referral", value: "Referral" },
  ];

  if (isEditMode && isLoadingLead) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Return button link */}
      <div>
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>

      <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-3xl p-8 transition duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isEditMode ? "Edit Lead Profile" : "Create New Sales Lead"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Contact name */}
          <Input
            {...register("name")}
            label="Contact Full Name"
            placeholder="e.g. John Doe"
            error={errors.name?.message}
          />

          {/* Email address */}
          <Input
            {...register("email")}
            label="Email Address"
            type="email"
            placeholder="e.g. john.doe@company.com"
            error={errors.email?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Stage */}
            <Select
              {...register("status")}
              label="Pipeline Stage Status"
              options={statusOptions}
              error={errors.status?.message}
            />

            {/* Sourcing Channel */}
            <Select
              {...register("source")}
              label="Sourcing Channel"
              options={sourceOptions}
              error={errors.source?.message}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 border-t border-lightBorder dark:border-darkBorder pt-6">
            <button
              onClick={() => navigate("/leads")}
              type="button"
              className="px-5 py-2.5 border border-lightBorder dark:border-darkBorder rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition disabled:opacity-55"
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Lead
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LeadForm;
