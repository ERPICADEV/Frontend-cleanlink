import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/services/adminService";
import type { AuditLog } from "@/types/admin";

export const useAuditLogs = (reportId: string | undefined): {
  data: AuditLog[];
  isLoading: boolean;
  error: Error | null | undefined;
} => {
  const {
    data: auditData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["audit-logs", reportId],
    queryFn: () => fetchAuditLogs(reportId!),
    enabled: Boolean(reportId),
  });

  const auditLogs: AuditLog[] = (auditData?.data || []).map((log: any) => {
    // Map backend action types to frontend ActionType
    let actionType = log.action_type?.toLowerCase() || "updated";
    
    // Transform backend action types to frontend format
    if (actionType === "report_resolved") actionType = "report_resolved";
    else if (actionType === "work_approved") actionType = "work_approved";
    else if (actionType === "work_rejected") actionType = "work_rejected";
    else if (actionType === "points_awarded") actionType = "points_awarded";
    else if (actionType === "user_level_up") actionType = "user_level_up";
    else if (actionType.startsWith("report_")) actionType = actionType.replace("report_", "");
    
    return {
      id: log.id,
      reportId: log.target_id,
      actionType: actionType as any,
      actor: log.actor?.username || log.actor?.email || "System",
      actorRole: log.actor?.role || "System",
      timestamp: log.created_at,
      changes: log.details?.changes || {},
      details: log.details?.notes || log.details?.reason || log.details?.rejection_reason || "",
      photos: log.details?.cleaned_image_url ? [log.details.cleaned_image_url] : undefined,
    };
  });

  return {
    data: auditLogs,
    isLoading,
    error: error || undefined,
  };
};

