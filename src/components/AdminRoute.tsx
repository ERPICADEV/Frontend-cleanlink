import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const { user, isBootstrapping } = useAuth();

  const isAdmin = user?.role && ['super_admin', 'field_admin', 'normal_admin'].includes(user.role);

  useEffect(() => {
    if (!isBootstrapping) {
      if (!user) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [isAdmin, user, isBootstrapping, navigate]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return <>{children}</>;
}