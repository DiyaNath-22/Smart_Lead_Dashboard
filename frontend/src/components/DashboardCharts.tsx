import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { Lead } from "../types/index.js";
import { useTheme } from "../context/ThemeContext.js";

interface ChartsProps {
  leads: Lead[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({ leads }) => {
  const { theme } = useTheme();
  
  // Theme colors configurations
  const isDark = theme === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#475569" : "#cbd5e1";

  // 1. Calculate status data (Funnel)
  const statusData = useMemo(() => {
    const counts = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    leads.forEach((l) => {
      if (l.status in counts) counts[l.status as keyof typeof counts]++;
    });
    return [
      { name: "New", value: counts.New },
      { name: "Contacted", value: counts.Contacted },
      { name: "Qualified", value: counts.Qualified },
      { name: "Lost", value: counts.Lost }
    ];
  }, [leads]);

  // 2. Calculate source distribution (Pie Chart)
  const sourceData = useMemo(() => {
    const counts = { Website: 0, Instagram: 0, Referral: 0 };
    leads.forEach((l) => {
      if (l.source in counts) counts[l.source as keyof typeof counts]++;
    });
    return [
      { name: "Website", value: counts.Website },
      { name: "Instagram", value: counts.Instagram },
      { name: "Referral", value: counts.Referral }
    ];
  }, [leads]);

  // 3. Calculate chronological acquisition (Area Chart)
  const acquisitionData = useMemo(() => {
    const monthlyCounts: Record<string, number> = {};
    
    // Sort leads chronologically
    const sortedLeads = [...leads].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedLeads.forEach((lead) => {
      const date = new Date(lead.createdAt);
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    });

    let cumulativeSum = 0;
    return Object.entries(monthlyCounts).map(([month, count]) => {
      cumulativeSum += count;
      return {
        month,
        "New Leads": count,
        "Total Leads": cumulativeSum
      };
    });
  }, [leads]);

  const PIE_COLORS = ["#6366f1", "#ec4899", "#10b981"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
      {/* Lead Acquisition Area Chart */}
      <div className="xl:col-span-2 bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 transition-all duration-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
          Lead Growth Timeline
        </h3>
        <div className="h-72 w-full">
          {acquisitionData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400">
              No historical data loaded.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={acquisitionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalLeadsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "12px",
                    color: isDark ? "#f1f5f9" : "#1e293b",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Total Leads"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalLeadsColor)"
                />
                <Area type="monotone" dataKey="New Leads" stroke="#10b981" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sourcing Channels Pie Chart */}
      <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 transition-all duration-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
          Lead Source Split
        </h3>
        <div className="h-56 w-full flex items-center justify-center">
          {leads.length === 0 ? (
            <div className="text-sm font-semibold text-slate-400">No leads.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
          {sourceData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Pipeline Stages Funnel Bar Chart */}
      <div className="xl:col-span-3 bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 transition-all duration-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
          Pipeline Funnel Stages
        </h3>
        <div className="h-64 w-full">
          {leads.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm font-semibold text-slate-400">
              No active pipeline leads.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => {
                    const statusColors = {
                      New: "#6366f1",
                      Contacted: "#3b82f6",
                      Qualified: "#10b981",
                      Lost: "#f43f5e"
                    };
                    const color = statusColors[entry.name as keyof typeof statusColors] || "#6366f1";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardCharts;
