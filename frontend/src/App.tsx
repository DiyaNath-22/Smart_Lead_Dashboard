import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import { ProtectedRoute } from "./routes/ProtectedRoute.js";
import { DashboardLayout } from "./layouts/DashboardLayout.js";

// Import view pages
import { Login } from "./pages/Login.js";
import { Register } from "./pages/Register.js";
import { Dashboard } from "./pages/Dashboard.js";
import { LeadsList } from "./pages/LeadsList.js";
import { LeadForm } from "./pages/LeadForm.js";
import { LeadDetails } from "./pages/LeadDetails.js";
import { Unauthorized } from "./pages/Unauthorized.js";
import { NotFound } from "./pages/NotFound.js";

// Initialize TanStack Query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<LeadsList />} />
                  <Route path="/leads/create" element={<LeadForm />} />
                  <Route path="/leads/edit/:id" element={<LeadForm />} />
                  <Route path="/leads/:id" element={<LeadDetails />} />
                </Route>
              </Route>

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* React Hot Toast Notifications configurations */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: "dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-700 font-medium text-sm rounded-xl",
                duration: 4000,
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
export default App;
