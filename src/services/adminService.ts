import apiClient from "@/lib/apiClient";
import type { 
  Report, 
  AssignReportPayload, 
  ResolveReportPayload, 
  AuditLog, 
  AdminUser as AdminUserType,
  ReportProgress,
  ProgressStatus
} from "@/types/admin";

// Extend the existing types
export interface AdminReport extends Report {
  progress?: ReportProgress;
  reporter?: {
    id: string;
    username: string;
    email: string;
  };
  assigned_to?: string;
  assigned_at?: string;
  assigned_by?: string;
  rejected_reason?: string;
  rejected_at?: string;
}

export interface AdminReportsResponse {
  data: AdminReport[];
  paging?: {
    next_cursor?: string;
  } | null;
}

export interface PendingApproval {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  images: string[];
  location: any;
  created_at: string;
  progress: {
    id: string;
    notes: string;
    photos: string[];
    completion_details: string;
    submitted_at: string;
    admin: {
      id: string;
      user_id: string;
      name: string;
      email: string;
    };
  };
}

export interface AdminStats {
  pendingReports: number;
  assignedToYou: number;
  resolvedThisMonth: number;
  avgResolutionTime: string;
  reportsByCategory: Record<string, number>;
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }[];
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
  assigned_to?: string;
}): Promise<AdminReportsResponse> => {
  const { data } = await apiClient.get<AdminReportsResponse>("/admin/reports", {
    params: {
      status: params?.status === "all" ? undefined : params?.status,
      category: params?.category === "all" ? undefined : params?.category,
      region: params?.region === "all" ? undefined : params?.region,
      sort: params?.sort || "new",
      limit: params?.limit || 20,
      assigned_to: params?.assigned_to,
      page: params?.page,
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

// PATCH /api/v1/admin/reports/:id/approve
export const approveReport = async (
  reportId: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/approve`);
  return data;
};

// PATCH /api/v1/admin/reports/:id/reject
export const rejectReport = async (
  reportId: string,
  rejectionReason: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/reject`, { 
    rejection_reason: rejectionReason 
  });
  return data;
};

// GET /api/v1/admin/pending-approvals
export const fetchPendingApprovals = async (params?: {
  limit?: number;
}): Promise<{ data: PendingApproval[] }> => {
  const { data } = await apiClient.get('/admin/pending-approvals', {
    params: {
      limit: params?.limit || 20,
    },
  });
  return data;
};

// PATCH /api/v1/admin/reports/:id/progress
export const updateReportProgress = async (
  reportId: string,
  payload: {
    progress_status?: ProgressStatus;
    notes?: string;
    photos?: string[];
    completion_details?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/progress`, payload);
  return data;
};

// PATCH /api/v1/admin/reports/:id/submit-approval
export const submitForApproval = async (
  reportId: string,
  payload: {
    completion_details: string;
    photos?: string[];
  }
): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/submit-approval`, payload);
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

// GET /api/v1/admin/users
export const fetchAdminUsers = async (): Promise<AdminUserType[]> => {
  const { data } = await apiClient.get<{ data: AdminUserType[] }>("/admin/users");
  return data.data || [];
};

// GET /api/v1/admin/reports/assigned
export const fetchAssignedReports = async (params?: {
  status?: string;
  sort?: string;
  limit?: number;
}): Promise<AdminReportsResponse> => {
  const { data } = await apiClient.get<AdminReportsResponse>("/admin/reports/assigned", {
    params: {
      status: params?.status === "all" ? undefined : params?.status,
      sort: params?.sort || "new",
      limit: params?.limit || 20,
    },
  });
  return data;
};

// GET /api/v1/admin/stats
export const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get<{ data: AdminStats }>("/admin/stats");
  return data.data || {
    pendingReports: 0,
    assignedToYou: 0,
    resolvedThisMonth: 0,
    avgResolutionTime: "0",
    reportsByCategory: {},
    recentActivity: [],
  };
};

// GET /api/v1/admin/audit/reports/:id
export const fetchReportAuditLogs = async (reportId: string): Promise<AuditLog[]> => {
  const { data } = await apiClient.get<{ data: AuditLog[] }>(`/admin/audit/reports/${reportId}`);
  return data.data || [];
};

