import React from "react";
import { Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";

interface NavbarProps {
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user } = useAuth();
  
  // Format current date display
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <header className="h-20 bg-lightCard dark:bg-darkCard border-b border-lightBorder dark:border-darkBorder px-8 flex items-center justify-between transition-colors duration-200">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Date tracker */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>{todayStr}</span>
        </div>

        {/* User avatar/name block */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {user.name}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {user.role}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
