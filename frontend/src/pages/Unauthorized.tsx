import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ChevronLeft } from "lucide-react";

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg text-slate-100 px-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6 p-8 rounded-3xl bg-darkCard/50 border border-darkBorder backdrop-blur-md shadow-2xl">
        <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <ShieldAlert className="w-12 h-12 animate-bounce" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed">
            You do not have the required administrative permissions to perform this operation or view this page.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition duration-200 mt-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
};
export default Unauthorized;
