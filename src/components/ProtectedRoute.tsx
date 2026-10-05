import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "faculty";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Verifying institutional credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated: redirect to login with intended role & redirect path
  if (!isAuthenticated) {
    const roleHint = requiredRole === "faculty" ? "faculty" : "student";
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?role=${roleHint}&redirect=${redirectParam}`} replace />;
  }

  // If a student tries to access faculty/admin dashboard:
  if (requiredRole === "faculty" && user?.role !== "faculty" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If a faculty member accesses the student dashboard:
  if (requiredRole === "student" && (user?.role === "faculty" || user?.role === "admin")) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
