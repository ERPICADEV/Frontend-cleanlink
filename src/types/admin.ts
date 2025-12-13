export type ReportStatus = "pending" | "assigned" | "resolved" | "flagged" | "in_progress" | "pending_approval" | "duplicate" | "community_verified" | "invalid";
export type ReportCategory = "pothole" | "garbage" | "flooding" | "street_maintenance" | "traffic" | "other";
export type ActionType = "created" | "updated" | "assigned" | "resolved" | "flagged" | "duplicate";

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  reporterId: string;
  reporterName: string;
  severity?: number;
  aiScore?: {
    legit?: number;
    severity?: number;
    duplicate_prob?: number;
    insights?: string[];
    confidence_label?: "low" | "medium" | "high" | "very_high";
    explanation?: string;
  };
  priority_score?: number;
  priority_label?: "Critical" | "High" | "Normal";
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  region?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  images?: string[];
  upvotes?: number;
  downvotes?: number;
  communityScore?: number;
  comments_count?: number;
}

export interface ReportsFilter {
  search: string;
  status: ReportStatus | "all";
  category: ReportCategory | "all";
  region: string | "all";
  sortBy: "newest" | "oldest" | "priority";
}

export interface DashboardStats {
  pendingReports: number;
  assignedToYou: number;
  resolvedThisMonth: number;
  avgResolutionTime: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  region: string;
  role: "admin" | "editor" | "viewer";
}

export interface AuditLog {
  id: string;
  reportId: string;
  actionType: ActionType;
  actor: string;
  actorRole: string;
  timestamp: string;
  changes?: Record<string, { before: any; after: any }>;
  details?: string;
  photos?: string[];
}

export interface AssignReportPayload {
  assigned_to: string;
  notes?: string;
}

export interface ResolveReportPayload {
  cleaned_image_url: string;
  notes?: string;
  status?: "resolved" | "cannot_fix" | "duplicate" | "invalid";
}

export type ProgressStatus = "not_started" | "in_progress" | "completed" | "on_hold";

export interface ReportProgress {
  id: string;
  report_id: string;
  progress_status: ProgressStatus;
  notes?: string;
  photos?: string[];
  completion_details?: string;
  submitted_at?: string;
  admin_id?: string;
}

