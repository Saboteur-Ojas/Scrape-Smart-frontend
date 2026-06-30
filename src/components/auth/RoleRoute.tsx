import { Navigate } from "react-router";
import type { ReactNode } from "react";
import type { UserRole } from "../../types/user";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface RoleRouteProps {
  role: UserRole;
  children: ReactNode;
}

export function RoleRoute({ role, children }: RoleRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    console.warn("[ScrapSmart] Missing profile in protected role route; redirecting to home.");
    return <Navigate to="/" replace />;
  }

  // Redirect to the correct dashboard if wrong role
  if (profile.role !== role) {
    const redirect = profile.role === "user" ? "/user/dashboard" : "/collector/dashboard";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
