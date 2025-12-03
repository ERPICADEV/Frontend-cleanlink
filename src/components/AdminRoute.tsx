import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type AllowedRole = 'super_admin' | 'field_admin';

interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
}

export default function AdminRoute({ children, allowedRoles }: AdminRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isBootstrapping } = useAuth();

  const isAdmin = user?.role && ['super_admin', 'field_admin'].includes(user.role);

  // Determine allowed roles based on route path if not explicitly provided
  const effectiveAllowedRoles: AllowedRole[] = allowedRoles || (
    location.pathname.startsWith('/admin') 
      ? ['super_admin'] 
      : location.pathname.startsWith('/field-admin')
      ? ['field_admin']
      : ['super_admin', 'field_admin']
  );

  const hasAccess = user?.role ? effectiveAllowedRoles.includes(user.role as AllowedRole) : false;

  useEffect(() => {
    if (!isBootstrapping) {
      if (!user) {
        navigate("/login", { replace: true });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      } else if (!hasAccess) {
        navigate("/404", { replace: true });
      }
    }
  }, [isAdmin, hasAccess, user, isBootstrapping, navigate]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin || !hasAccess) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
