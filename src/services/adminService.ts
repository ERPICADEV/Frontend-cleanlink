import apiClient from "@/lib/apiClient";
import type { Report, AssignReportPayload, ResolveReportPayload, AuditLog } from "@/types/admin";

export interface AdminReportsResponse {
  data: Report[];
  paging?: {
    next_cursor?: string;
  } | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  paging?: null;
}

// GET /api/v1/admin/reports
export const fetchAdminReports = async (params?: {
  status?: string;
  category?: string;
  region?: string;
  sort?: string;
  limit?: number;
  page?: number;
}): Promise<AdminReportsResponse> => {
  const { data } = await apiClient.get<AdminReportsResponse>("/admin/reports", {
    params: {
      status: params?.status === "all" ? undefined : params?.status,
      category: params?.category === "all" ? undefined : params?.category,
      region: params?.region === "all" ? undefined : params?.region,
      sort: params?.sort || "new",
      limit: params?.limit || 20,
    },
  });
  return data;
};

// PATCH /api/v1/admin/reports/:id/assign
export const assignReport = async (
  reportId: string,
  payload: AssignReportPayload
): Promise<{ id: string; status: string; assigned_to: string; assigned_by: string; assigned_at: string }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/assign`, payload);
  return data;
};

// PATCH /api/v1/admin/reports/:id/resolve
export const resolveReport = async (
  reportId: string,
  payload: ResolveReportPayload
): Promise<{ id: string; status: string; resolved_by: string; resolved_at: string; points_awarded?: number }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/resolve`, payload);
  return data;
};

// GET /api/v1/admin/audit/reports/:id
export const fetchAuditLogs = async (reportId: string): Promise<AuditLogsResponse> => {
  const { data } = await apiClient.get<AuditLogsResponse>(`/admin/audit/reports/${reportId}`);
  return data;
};

// Helper to fetch admin users (if endpoint exists, otherwise use mock)
export const fetchAdminUsers = async (): Promise<Array<{ id: string; name: string; email: string; region: string; role: string }>> => {
  try {
    const { data } = await apiClient.get("/admin/users");
    return data;
  } catch {
    // Fallback to empty array - will be populated from user context or mock
    return [];
  }
};

