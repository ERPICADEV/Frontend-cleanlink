import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Report } from "@/types/admin";

export const useAdmin = () => {
  const { user, isBootstrapping } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user || isBootstrapping) return undefined;
    return user.role === "admin" || user.role === "super_admin" || user.permissions?.includes("admin:access");
  }, [user, isBootstrapping]);

  const adminRegion = useMemo(() => {
    if (!user) return null;
    return user.adminRegion || null;
  }, [user]);

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === "super_admin";
  }, [user]);

  const canEditReport = (report: Report): boolean => {
    if (!isAdmin) return false;
    if (isSuperAdmin) return true;
    // Check if report is in admin's region
    if (adminRegion && report.region) {
      return report.region.toLowerCase().includes(adminRegion.toLowerCase()) || 
             adminRegion.toLowerCase().includes(report.region.toLowerCase());
    }
    return true; // If no region restriction, allow
  };

  const canViewAuditLog = (report: Report): boolean => {
    return isAdmin === true; // All admins can view audit logs
  };

  return {
    isAdmin,
    adminRegion,
    isSuperAdmin,
    canEditReport,
    canViewAuditLog,
  };
};

