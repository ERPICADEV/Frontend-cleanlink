import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;
}

/**
 * Basic protected route for regular users.
 * - Redirects unauthenticated users to /login with ?redirect=<original-path>
 * - Allows already authenticated users through without page reload.
 *
 * Note: Admin sections already use a separate AdminRoute.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}


