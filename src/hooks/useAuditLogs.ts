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

  const auditLogs: AuditLog[] = (auditData?.data || []).map((log: any) => ({
    id: log.id,
    reportId: log.target_id,
    actionType: log.action_type?.toLowerCase().replace("report_", "") as any,
    actor: log.actor?.username || log.actor?.email || "System",
    actorRole: log.actor?.role || "System",
    timestamp: log.created_at,
    changes: log.details?.changes || {},
    details: log.details?.notes || log.details?.reason || "",
    photos: log.details?.cleaned_image_url ? [log.details.cleaned_image_url] : undefined,
  }));

  return {
    data: auditLogs,
    isLoading,
    error: error || undefined,
  };
};

