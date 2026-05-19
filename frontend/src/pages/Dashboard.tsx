import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Flame, Loader2, Sparkles, TrendingUp } from "lucide-react";
import apiClient from "../api/client.js";
import { Lead } from "../types/index.js";
import { DashboardCharts } from "../components/DashboardCharts.js";

export const Dashboard: React.FC = () => {
  // Fetch up to 1000 leads for complete analytics summary
  const { data: leads = [], isLoading, isError } = useQuery<Lead[]>({
    queryKey: ["all-leads-analytics"],
    queryFn: async () => {
      const res = await apiClient.get("/leads?limit=1000");
      return res.data.data.leads;
    },
  });

  // Calculate quick metrics
  const stats = useMemo(() => {
    const total = leads.length;
    let newLeads = 0;
    let contacted = 0;
    let qualified = 0;
    let lost = 0;

    leads.forEach((l) => {
      if (l.status === "New") newLeads++;
      else if (l.status === "Contacted") contacted++;
      else if (l.status === "Qualified") qualified++;
      else if (l.status === "Lost") lost++;
    });

    // Conversion rate: Qualified / Total (exclude lost or include depending on metric design)
    const conversionRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

    return {
      total,
      newLeads,
      contacted,
      qualified,
      lost,
      conversionRate
    };
  }, [leads]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-slate-400 text-sm font-semibold">Recalculating pipeline analytics...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl text-rose-600">
        Failed to fetch leads records. Please verify server connection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden border border-indigo-800 shadow-xl shadow-indigo-950/20">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            CRM AI Engine Active
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-indigo-200/80 text-sm max-w-lg font-medium leading-relaxed">
            Real-time pipeline metrics, conversion percentages, and chronological lead growth tracking summaries.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {/* Total Active Leads */}
        <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Active
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Contacted Leads */}
        <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Contacted
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.contacted}
            </div>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Qualified
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.qualified}
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
          <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Conversion
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.conversionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Render Charts */}
      <DashboardCharts leads={leads} />
    </div>
  );
};
export default Dashboard;
