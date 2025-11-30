import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuditTimeline } from "@/components/admin/audit/AuditTimeline";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { CategoryBadge } from "@/components/admin/shared/CategoryBadge";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useQuery } from "@tanstack/react-query";
import { fetchReportDetail } from "@/services/reportService";
import { Skeleton } from "@/components/ui/skeleton";
import type { Report, AuditLog } from "@/types/admin";

// Mock report data
const mockReport: Report = {
  id: "rpt-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  title: "Large pothole on Main Street causing traffic issues",
  description: "Deep pothole approximately 30cm wide near the intersection. Multiple vehicles have been damaged. Requires urgent attention from the maintenance team.",
  category: "pothole",
  status: "resolved",
  reporterId: "user-1",
  reporterName: "John Doe",
  severity: 4,
  aiScore: { legit: 0.92, severity: 0.87 },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-17T15:30:00Z",
  assignedTo: "admin-1",
  assignedToName: "Sarah Khan",
  region: "Delhi",
};

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    reportId: mockReport.id,
    actionType: "created",
    actor: "John Doe",
    actorRole: "Reporter",
    timestamp: "2024-01-15T10:30:00Z",
    changes: {
      title: { before: null, after: "Large pothole on Main Street causing traffic issues" },
      description: { before: null, after: "Deep pothole approximately 30cm wide..." },
      status: { before: null, after: "pending" },
      category: { before: null, after: "pothole" },
    },
    details: "New report submitted via mobile app",
  },
  {
    id: "log-2",
    reportId: mockReport.id,
    actionType: "updated",
    actor: "AI Analysis System",
    actorRole: "System Bot",
    timestamp: "2024-01-15T10:32:00Z",
    changes: {
      aiScore: { before: null, after: { legit: 0.92, severity: 0.87 } },
      status: { before: "pending", after: "community_verified" },
    },
    details: "Automated AI analysis completed. Report verified as legitimate with high confidence.",
  },
  {
    id: "log-3",
    reportId: mockReport.id,
    actionType: "assigned",
    actor: "Sarah Khan",
    actorRole: "Admin - Delhi Region",
    timestamp: "2024-01-16T09:00:00Z",
    changes: {
      assignedTo: { before: null, after: "Sarah Khan" },
      status: { before: "community_verified", after: "assigned" },
    },
    details: "Assigned to pothole repair team for urgent action. Priority level: High.",
  },
  {
    id: "log-4",
    reportId: mockReport.id,
    actionType: "updated",
    actor: "MCD Field Team",
    actorRole: "System",
    timestamp: "2024-01-17T14:00:00Z",
    changes: {
      fieldVisit: { before: null, after: "completed" },
    },
    details: "Field team visited the location and confirmed the issue. Repair work initiated.",
  },
  {
    id: "log-5",
    reportId: mockReport.id,
    actionType: "resolved",
    actor: "Sarah Khan",
    actorRole: "Admin - Delhi Region",
    timestamp: "2024-01-17T15:30:00Z",
    changes: {
      status: { before: "assigned", after: "resolved" },
      resolution: { before: null, after: "Pothole has been filled and road surface leveled" },
    },
    details: "Issue fixed by MCD maintenance team. Pothole filled with asphalt and road surface properly leveled.",
    photos: ["before.jpg", "after.jpg"],
  },
];

export default function AuditLogsPage() {
  const { reportId } = useParams();
  
  if (!reportId) {
    return (
      <AdminLayout
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reports", href: "/admin/reports" },
          { label: "Audit Log" },
        ]}
      >
        <div className="space-y-6 max-w-4xl">
          <Button variant="ghost" asChild className="-ml-2">
            <Link to="/admin/reports">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Link>
          </Button>
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <p className="text-muted-foreground">No report ID provided. Please select a report to view its audit log.</p>
            <Button asChild className="mt-4">
              <Link to="/admin/reports">Go to Reports</Link>
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  // Fetch report details
  const {
    data: reportData,
    isLoading: reportLoading,
    isError: reportError,
  } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => fetchReportDetail(reportId!),
    enabled: Boolean(reportId),
  });

  // Fetch audit logs
  const {
    data: auditLogs = [],
    isLoading: auditLoading,
    isError: auditError,
  } = useAuditLogs(reportId);

  // Transform report data to match our type
  const report: Report | null = reportData ? {
    id: reportData.id,
    title: reportData.title,
    description: reportData.description,
    category: reportData.category as any,
    status: reportData.status as any,
    reporterId: reportData.reporter?.id || "",
    reporterName: reportData.reporter?.username || "Anonymous",
    severity: reportData.aiScore?.severity ? Math.round(reportData.aiScore.severity * 5) : undefined,
    aiScore: reportData.aiScore,
    createdAt: reportData.createdAt,
    updatedAt: (reportData as any).updatedAt || reportData.createdAt,
    assignedTo: reportData.mcdVerifiedBy,
    region: reportData.location?.city || reportData.location?.area_name || "Unknown",
    location: reportData.location,
    images: reportData.images as string[],
    upvotes: reportData.upvotes,
    downvotes: reportData.downvotes,
    communityScore: reportData.communityScore,
    comments_count: reportData.comments_count,
  } : null;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Reports", href: "/admin/reports" },
        { label: "Audit Log" },
      ]}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="-ml-2">
          <Link to="/admin/reports">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Link>
        </Button>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of actions for this report
          </p>
        </div>

        {/* Report Summary Card */}
        {reportLoading ? (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : report ? (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">{report.title}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <CategoryBadge category={report.category} />
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    {report.region}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Reporter:{" "}
                    <span className="text-foreground font-medium">
                      {report.reporterName}
                    </span>
                  </p>
                  <p className="mt-1 line-clamp-2">{report.description}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/post/${report.id}`}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Report
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-6 text-center text-muted-foreground">
            Report not found
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          {auditError ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
              <p className="text-destructive text-sm">
                Failed to load audit logs. Please try again.
              </p>
            </div>
          ) : auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded" />
              ))}
            </div>
          ) : auditLogs.length > 0 ? (
            <AuditTimeline logs={auditLogs} />
          ) : (
            <div className="text-center text-muted-foreground py-8 bg-muted/30 rounded-lg">
              <p className="text-sm">No audit logs found for this report</p>
              <p className="text-xs mt-1">Activity will appear here as actions are taken on this report</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
