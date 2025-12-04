import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Report } from "@/types/admin";

export interface AdminContext {
  user: ReturnType<typeof useAuth>["user"];
  isAdmin: boolean | undefined;
  adminRegion: string | null;
  isSuperAdmin: boolean;
  canEditReport: (report: Report) => boolean;
  canViewAuditLog: (report: Report) => boolean;
}

export const useAdmin = (): AdminContext => {
  const { user, isBootstrapping } = useAuth();

  const isAdmin = useMemo(() => {
    if (!user || isBootstrapping) return undefined;
    return (
      user.role === "field_admin" ||
      user.role === "super_admin" ||
      user.permissions?.includes("admin:access")
    );
  }, [user, isBootstrapping]);

  const adminRegion = useMemo(() => {
    if (!user) return null;
    return (user as any).adminRegion || user.region?.city || null;
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
      return (
        report.region.toLowerCase().includes(adminRegion.toLowerCase()) ||
        adminRegion.toLowerCase().includes(report.region.toLowerCase())
      );
    }
    return true; // If no region restriction, allow
  };

  const canViewAuditLog = (_report: Report): boolean => {
    return isAdmin === true; // All admins can view audit logs
  };

  return {
    user,
    isAdmin,
    adminRegion,
    isSuperAdmin,
    canEditReport,
    canViewAuditLog,
  };
};

