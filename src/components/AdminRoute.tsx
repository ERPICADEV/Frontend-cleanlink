import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping } = useAuth();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (!isBootstrapping) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (isAdmin === false) {
        navigate("/");
      }
    }
  }, [isAdmin, isAuthenticated, isBootstrapping, navigate]);

  if (isBootstrapping || isAdmin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

