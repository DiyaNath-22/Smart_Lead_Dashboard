import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Mail,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  Sparkles,
  Phone,
  Video,
  FileText
} from "lucide-react";
import apiClient from "../api/client.js";
import { Lead } from "../types/index.js";
import { useAuth } from "../context/AuthContext.js";
import { ConfirmModal } from "../components/ConfirmModal.js";

interface ActivityLog {
  id: string;
  type: "Email" | "Call" | "Meeting" | "Note";
  title: string;
  notes: string;
  timestamp: string;
}

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local activity logger states
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [logType, setLogType] = useState<"Email" | "Call" | "Meeting" | "Note">("Email");
  const [logTitle, setLogTitle] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch lead details from server
  const { data: lead, isLoading, isError } = useQuery<Lead>({
    queryKey: ["lead-details", id],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${id}`);
      return res.data.data.lead;
    },
  });

  // Load activities timeline from localStorage key
  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`smart_crm_timeline_${id}`);
      if (stored) {
        setActivities(JSON.parse(stored));
      } else {
        // Populate with mock initial timeline
        const initialMock: ActivityLog[] = [
          {
            id: "1",
            type: "Email",
            title: "Initial CRM Signup",
            notes: "Lead registered contact details on product marketing landing page.",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setActivities(initialMock);
        localStorage.setItem(`smart_crm_timeline_${id}`, JSON.stringify(initialMock));
      }
    }
  }, [id]);

  // Lead deletion mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      toast.success("Lead record deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["leads-list"] });
      queryClient.invalidateQueries({ queryKey: ["all-leads-analytics"] });
      navigate("/leads");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete lead.");
    },
  });

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim()) {
      toast.error("Please provide an interaction title.");
      return;
    }

    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type: logType,
      title: logTitle,
      notes: logNotes,
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...activities];
    setActivities(updated);
    if (id) {
      localStorage.setItem(`smart_crm_timeline_${id}`, JSON.stringify(updated));
    }

    // Reset inputs
    setLogTitle("");
    setLogNotes("");
    toast.success("New interaction logged successfully.");
  };

  // Evaluate simulated AI Lead Score
  const aiScorecard = useMemo(() => {
    if (!lead) return null;

    let score = 50; // base score
    const positives: string[] = [];
    const negatives: string[] = [];

    // Evaluate Stage status
    if (lead.status === "Qualified") {
      score += 25;
      positives.push("Lead is in advanced Qualified stage (+25)");
    } else if (lead.status === "Contacted") {
      score += 15;
      positives.push("Initial contact established (+15)");
    } else if (lead.status === "Lost") {
      score -= 30;
      negatives.push("Lost opportunity status (-30)");
    }

    // Evaluate Email domain type
    const domain = lead.email.split("@")[1] || "";
    const publicDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    if (publicDomains.includes(domain.toLowerCase())) {
      score -= 10;
      negatives.push("Registered using public webmail domain (-10)");
    } else {
      score += 15;
      positives.push("Verified corporate email domain source (+15)");
    }

    // Sourcing weights
    if (lead.source === "Referral") {
      score += 15;
      positives.push("Acquired through high-affinity Referral (+15)");
    } else if (lead.source === "Website") {
      score += 5;
      positives.push("Organic inbound website capture (+5)");
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Define Tiers
    let tier: "Hot" | "Warm" | "Cold" = "Warm";
    let tierColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900";
    let recommendation = "Schedule follow-up email and product sheet.";

    if (score >= 75) {
      tier = "Hot";
      tierColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900";
      recommendation = "Call lead contact within 2 hours. Prepare tailored SaaS integration proposal.";
    } else if (score < 40) {
      tier = "Cold";
      tierColor = "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900";
      recommendation = "Add to monthly product email nurture campaign lists.";
    }

    return {
      score,
      tier,
      tierColor,
      recommendation,
      positives,
      negatives
    };
  }, [lead]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl text-rose-600">
        Lead record not found or server is unreachable.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Return button link */}
      <div className="flex items-center justify-between">
        <Link
          to="/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* Edit and Delete operations */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/leads/edit/${lead._id}`)}
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-lightBorder dark:border-darkBorder rounded-xl bg-lightCard dark:bg-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs shadow-sm transition"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>

          <button
            onClick={() => {
              if (user?.role !== "Admin") {
                toast.error("Access Denied: Admin authorization required to delete lead profiles.");
                return;
              }
              setIsDeleteModalOpen(true);
            }}
            type="button"
            disabled={user?.role !== "Admin"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/10 font-bold text-xs shadow-sm transition ${
              user?.role !== "Admin" ? "opacity-40 cursor-not-allowed" : "hover:bg-rose-50 dark:hover:bg-rose-950/20"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete Lead
          </button>
        </div>
      </div>

      {/* Main Grid: Details & AI Scorer vs. Activities log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Col 1 & 2: Details and AI Scoring */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card: Lead summary */}
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-3xl p-6 transition">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
              Lead Information
            </h3>

            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {lead.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-semibold text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {lead.email}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-lightBorder dark:border-darkBorder pt-6">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Stage Status</div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                    {lead.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Source Channel</div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {lead.source}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Acquisition Date</div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    <Calendar className="w-4.5 h-4.5 text-slate-400" />
                    {new Date(lead.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: AI Lead Score Card */}
          {aiScorecard && (
            <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-3xl p-6 transition">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  AI Lead Scoring
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  AI Scored
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Visual Score Ring */}
                <div className="relative w-36 h-36 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full border border-lightBorder dark:border-darkBorder shadow-inner shrink-0">
                  <svg className="absolute w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-slate-100 dark:text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - aiScorecard.score / 100)}
                      className="text-indigo-600 dark:text-indigo-500"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{aiScorecard.score}</span>
                    <span className="text-slate-400 dark:text-slate-500 block text-xs font-semibold">out of 100</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {/* Score Tier classification */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Classification:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${aiScorecard.tierColor}`}>
                      {aiScorecard.tier} Lead
                    </span>
                  </div>

                  {/* Call Action Recommendation */}
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Sales Action Recommendation</div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950 p-3 rounded-xl leading-relaxed">
                      {aiScorecard.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Influencing factors split lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-lightBorder dark:border-darkBorder pt-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">Positive Factors</h4>
                  <ul className="flex flex-col gap-1.5">
                    {aiScorecard.positives.map((p, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                    {aiScorecard.positives.length === 0 && (
                      <li className="text-xs text-slate-400 font-semibold italic">No positive weight indicators.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">Negative Factors</h4>
                  <ul className="flex flex-col gap-1.5">
                    {aiScorecard.negatives.map((n, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <Layers className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{n}</span>
                      </li>
                    ))}
                    {aiScorecard.negatives.length === 0 && (
                      <li className="text-xs text-slate-400 font-semibold italic">No negative weight indicators.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Col 3: Activities Logger Form & Timeline */}
        <div className="flex flex-col gap-6">
          {/* Card: Add new activity log */}
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-3xl p-6 transition">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Log New Interaction
            </h3>

            <form onSubmit={handleLogActivity} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 block">
                  Activity Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Email", "Call", "Meeting", "Note"] as const).map((type) => {
                    const icons = {
                      Email: Mail,
                      Call: Phone,
                      Meeting: Video,
                      Note: FileText
                    };
                    const Icon = icons[type];
                    const active = logType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setLogType(type)}
                        className={`py-2 rounded-xl flex flex-col items-center gap-1 font-bold text-[10px] border transition ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                  Summary Title
                </label>
                <input
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  type="text"
                  placeholder="e.g. Left a voicemail"
                  className="px-4 py-2 border bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                  Interaction Notes
                </label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Summarize discussion details..."
                  rows={3}
                  className="px-4 py-2 border bg-slate-50 dark:bg-slate-900 border-lightBorder dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Log Interaction
              </button>
            </form>
          </div>

          {/* Timeline history */}
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-3xl p-6 transition flex-1 flex flex-col max-h-[420px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 shrink-0">
              Interaction Timeline
            </h3>

            <div className="overflow-y-auto flex-1 flex flex-col gap-4 pr-1">
              {activities.map((act) => {
                const colors = {
                  Email: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
                  Call: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  Meeting: "bg-pink-500/10 text-pink-500 border-pink-500/20",
                  Note: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                };
                return (
                  <div key={act.id} className="relative pl-6 pb-2 border-l border-lightBorder dark:border-darkBorder last:border-0 last:pb-0">
                    <span className="absolute -left-2 top-0.5 w-4 h-4 rounded-full border bg-lightCard dark:bg-darkCard flex items-center justify-center text-[9px] font-bold text-indigo-500 border-lightBorder dark:border-darkBorder shadow-sm">
                      •
                    </span>
                    
                    <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-900/50 border border-lightBorder dark:border-darkBorder p-3 rounded-2xl">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {act.title}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${colors[act.type]}`}>
                          {act.type}
                        </span>
                      </div>
                      
                      {act.notes && (
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                          {act.notes}
                        </p>
                      )}
                      
                      <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                        {new Date(act.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No logged interactions.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deletion modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Confirm Lead Deletion"
        message={`Are you sure you want to delete lead ${lead.name}? This action is permanent and cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
};
export default LeadDetails;
