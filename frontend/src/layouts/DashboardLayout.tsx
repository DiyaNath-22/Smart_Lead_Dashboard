import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.js";
import { Navbar } from "../components/Navbar.js";
import { useAuth } from "../context/AuthContext.js";

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-sm text-slate-400">Loading SmartLeads CRM...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Map route path to page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard Analytics";
    if (path.startsWith("/leads/create")) return "Add New Sales Lead";
    if (path.startsWith("/leads/edit")) return "Edit Lead Record";
    if (path.startsWith("/leads/")) return "Sales Lead Details";
    if (path.startsWith("/leads")) return "Sales Leads Directory";
    return "CRM Dashboard";
  };

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-darkBg text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar title={getPageTitle()} />

        {/* View Content Port */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
