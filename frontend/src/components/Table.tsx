import React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface Column<T> {
  header: string;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto w-full border border-lightBorder dark:border-darkBorder rounded-2xl bg-lightCard dark:bg-darkCard transition-all duration-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-lightBorder dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/50">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`p-4 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-lightBorder dark:divide-darkBorder">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                    Fetching directory content...
                  </span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <AlertCircle className="w-8 h-8" />
                  <span className="text-sm font-semibold">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30"
                    : ""
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`p-4 align-middle text-slate-600 dark:text-slate-300 font-medium ${col.className || ""}`}
                  >
                    {col.render(item, rowIdx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export default Table;
