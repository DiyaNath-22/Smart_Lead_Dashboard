import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Sun, Moon, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useTheme } from "../context/ThemeContext.js";

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-lightCard dark:bg-darkCard border-r border-lightBorder dark:border-darkBorder flex flex-col justify-between p-6 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Brand header logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            SmartLeads AI
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              }`
            }
          >
            <Users className="w-5 h-5" />
            Leads Directory
          </NavLink>
        </nav>
      </div>

      {/* Footer operations */}
      <div className="flex flex-col gap-4 border-t border-lightBorder dark:border-darkBorder pt-4">
        {/* Active User Badge info */}
        {user && (
          <div className="px-2 py-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
            <div className="text-xs font-medium px-2 py-0.5 mt-1 inline-block rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              {user.role}
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          type="button"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              Dark Mode
            </>
          )}
        </button>

        <button
          onClick={logout}
          type="button"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
