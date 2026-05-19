import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import apiClient from "../api/client.js";
import { Lead, PaginationMetadata } from "../types/index.js";
import { useAuth } from "../context/AuthContext.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { Table } from "../components/Table.js";
import { ConfirmModal } from "../components/ConfirmModal.js";

export const LeadsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Deletion Modal States
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source, sort]);

  // Fetch leads with active queries parameters
  const { data, isLoading } = useQuery<{ leads: Lead[]; metadata: PaginationMetadata }>({
    queryKey: ["leads-list", { status, source, search: debouncedSearch, sort, page }],
    queryFn: async () => {
      const params = {
        status: status !== "All" ? status : undefined,
        source: source !== "All" ? source : undefined,
        search: debouncedSearch || undefined,
        sort,
        page,
        limit: 10,
      };
      const res = await apiClient.get("/leads", { params });
      return res.data.data;
    },
  });

  // Leads Deletion Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      toast.success("Lead deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["leads-list"] });
      queryClient.invalidateQueries({ queryKey: ["all-leads-analytics"] });
      setIsDeleteModalOpen(false);
      setLeadToDelete(null);
    },
    onError: (err: any) => {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to delete lead. Check permissions.";
      toast.error(errMsg);
      setIsDeleteModalOpen(false);
    },
  });

  const handleDeleteClick = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.role !== "Admin") {
      toast.error("Access Denied: Only Administrator accounts can delete lead records.");
      return;
    }
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete._id);
    }
  };

  // CSV Export utility
  const handleExportCSV = async () => {
    try {
      const params = {
        status: status !== "All" ? status : undefined,
        source: source !== "All" ? source : undefined,
        search: debouncedSearch || undefined,
        sort,
      };
      const response = await apiClient.get("/leads/export", {
        params,
        responseType: "blob",
      });

      // Stream download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `smart-leads-export-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export download started.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate CSV export file.");
    }
  };

  const leads = data?.leads || [];
  const metadata = data?.metadata || {
    total: 0,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const columns = [
    {
      header: "Lead Contact",
      render: (item: Lead) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
          <div className="text-xs text-slate-400 font-medium">{item.email}</div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (item: Lead) => {
        const colors = {
          New: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900",
          Contacted: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900",
          Qualified: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900",
          Lost: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900",
        };
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colors[item.status]}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      header: "Source",
      render: (item: Lead) => {
        const sourceColors = {
          Website: "bg-indigo-100/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400",
          Instagram: "bg-pink-100/50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400",
          Referral: "bg-amber-100/50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400",
        };
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${sourceColors[item.source]}`}>
            {item.source}
          </span>
        );
      },
    },
    {
      header: "Created Date",
      render: (item: Lead) => (
        <span className="text-slate-400 font-semibold text-xs">
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (item: Lead) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/leads/${item._id}`)}
            type="button"
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="View Details"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>
          
          <button
            onClick={() => navigate(`/leads/edit/${item._id}`)}
            type="button"
            className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit Lead"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </button>

          {/* Delete button: Fade & disable if user is not Admin */}
          <button
            onClick={(e) => handleDeleteClick(item, e)}
            type="button"
            disabled={user?.role !== "Admin"}
            className={`p-2 rounded-lg transition ${
              user?.role === "Admin"
                ? "text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40"
            }`}
            title={user?.role === "Admin" ? "Delete Record" : "Admin access required to delete"}
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Action Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
            Leads Directory
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Analyze, segment, and export lead contacts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-lightBorder dark:border-darkBorder bg-lightCard dark:bg-darkCard hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm transition"
          >
            <Download className="w-4.5 h-4.5" />
            CSV Export
          </button>

          <button
            onClick={() => navigate("/leads/create")}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4.5 h-4.5" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder transition-all duration-200">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm font-medium"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            <Filter className="w-4.5 h-4.5" />
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold transition"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Filter Source */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            <Filter className="w-4.5 h-4.5" />
          </span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold transition"
          >
            <option value="All">All Sources</option>
            <option value="Website">Website</option>
            <option value="Instagram">Instagram</option>
            <option value="Referral">Referral</option>
          </select>
        </div>

        {/* Sort option */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-lightBorder dark:border-darkBorder rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Leads Directory Table */}
      <Table<Lead>
        columns={columns}
        data={leads}
        isLoading={isLoading}
        emptyMessage="No leads match your search/filter parameters."
        onRowClick={(item) => navigate(`/leads/${item._id}`)}
      />

      {/* Pagination controls */}
      {!isLoading && metadata.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-1">
          <span className="text-xs text-slate-400 font-semibold">
            Showing Page {metadata.page} of {metadata.totalPages} ({metadata.total} total leads)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!metadata.hasPrevPage}
              type="button"
              className="p-2 bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-lightCard transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, metadata.totalPages))}
              disabled={!metadata.hasNextPage}
              type="button"
              className="p-2 bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-lightCard transition shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reusable Delete Confirmation modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Confirm Lead Deletion"
        message={`Are you sure you want to delete lead ${leadToDelete?.name}? This action is permanent and cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};
export default LeadsList;
