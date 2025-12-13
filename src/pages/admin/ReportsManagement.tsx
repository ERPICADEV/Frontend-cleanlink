import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ReportsFilters } from "@/components/admin/reports/ReportsFilters";
import { ReportsTable } from "@/components/admin/reports/ReportsTable";
import { AssignReportModal } from "@/components/admin/modals/AssignReportModal";
import { useAdminReports } from "@/hooks/useAdminReports";
import { useAdmin } from "@/hooks/useAdmin";
import type { Report, ReportsFilter, ReportStatus } from "@/types/admin";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data (fallback)
const mockReports: Report[] = [
  {
    id: "rpt-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Large pothole on Main Street causing traffic issues",
    description: "Deep pothole approximately 30cm wide near the intersection",
    category: "pothole",
    status: "pending",
    reporterId: "user-1",
    reporterName: "John Doe",
    severity: 4,
    aiScore: { legit: 0.92, severity: 0.87 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    region: "Delhi",
  },
  {
    id: "rpt-b2c3d4e5-f6a7-8901-bcde-f23456789012",
    title: "Garbage pile near residential area",
    description: "Uncollected garbage for past 3 days",
    category: "garbage",
    status: "assigned",
    reporterId: "user-2",
    reporterName: "Jane Smith",
    severity: 3,
    aiScore: { legit: 0.88, severity: 0.65 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    assignedTo: "admin-1",
    assignedToName: "Sarah Khan",
    region: "Delhi",
  },
  {
    id: "rpt-c3d4e5f6-a7b8-9012-cdef-345678901234",
    title: "Street flooding after rain",
    description: "Blocked drain causing water logging",
    category: "flooding",
    status: "resolved",
    reporterId: "user-3",
    reporterName: "Amit Patel",
    severity: 5,
    aiScore: { legit: 0.95, severity: 0.92 },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    assignedTo: "admin-2",
    assignedToName: "Rajesh Sharma",
    region: "Mumbai",
  },
  {
    id: "rpt-d4e5f6a7-b8c9-0123-defa-456789012345",
    title: "Broken street light on Park Avenue",
    description: "Street light not working for a week",
    category: "street_maintenance",
    status: "flagged",
    reporterId: "user-4",
    reporterName: "Priya Singh",
    severity: 2,
    aiScore: { legit: 0.45, severity: 0.30 },
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    region: "Bangalore",
  },
  {
    id: "rpt-e5f6a7b8-c9d0-1234-efab-567890123456",
    title: "Traffic signal malfunction at busy junction",
    description: "Signal stuck on red for all directions",
    category: "traffic",
    status: "pending",
    reporterId: "user-5",
    reporterName: "Vikram Kumar",
    severity: 5,
    aiScore: { legit: 0.98, severity: 0.95 },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    region: "Chennai",
  },
  {
    id: "rpt-f6a7b8c9-d0e1-2345-fabc-678901234567",
    title: "Duplicate report - same pothole",
    description: "This is the same pothole reported earlier",
    category: "pothole",
    status: "duplicate",
    reporterId: "user-6",
    reporterName: "Meera Reddy",
    severity: 4,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    region: "Delhi",
  },
];

const defaultFilters: ReportsFilter = {
  search: "",
  status: "all",
  category: "all",
  region: "all",
  sortBy: "priority", // Default to priority sorting
};

export default function ReportsManagement() {
  const navigate = useNavigate();
  const { adminRegion } = useAdmin();
  const {
    reports,
    loading,
    filters: hookFilters,
    setFilters: setHookFilters,
    assignReport,
    isAssigning,
  } = useAdminReports(adminRegion ? { region: adminRegion } : undefined);

  const [filters, setFilters] = useState<ReportsFilter>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sync local filters with hook filters
  const handleFiltersChange = (newFilters: ReportsFilter) => {
    setFilters(newFilters);
    setHookFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Filter reports (client-side for search, server handles status/category/region)
  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchLower) ||
          report.id.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [reports, filters.search]);

  // Clear selections when filtered reports change (to avoid invalid selections)
  useEffect(() => {
    const validIds = new Set(filteredReports.map((r) => r.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [filteredReports]);

  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / pageSize);
  const paginatedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  const handleAssign = (report: Report) => {
    setSelectedReport(report);
    setAssignModalOpen(true);
  };


  const handleViewAudit = (reportId: string) => {
    navigate(`/admin/audit/${reportId}`);
  };

  const handleAssignSubmit = async (reportId: string, adminId: string, notes: string) => {
    await assignReport(reportId, { assigned_to: adminId, notes });
    setAssignModalOpen(false);
    setSelectedReport(null);
  };


  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Reports" },
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports Management</h1>
          <p className="text-muted-foreground">
            View and assign citizen reports
          </p>
        </div>

        {/* Filters */}
        <ReportsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={() => {
            setFilters(defaultFilters);
            setHookFilters(defaultFilters);
            setPage(1); // Reset to first page when filters reset
          }}
        />

        {/* Table Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{paginatedReports.length}</span> of{" "}
            <span className="font-medium text-foreground">{totalReports}</span> reports
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Select All */}
            <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
              <Checkbox
                checked={selectedIds.length === paginatedReports.length && paginatedReports.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds(paginatedReports.map((r) => r.id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
              />
              <span className="hidden sm:inline">Select All</span>
              <span className="sm:hidden">Select</span>
            </label>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Bulk Actions ({selectedIds.length})
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>Assign All Selected</DropdownMenuItem>
                  <DropdownMenuItem disabled>Resolve All Selected</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" disabled>
                    Mark as Spam
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
            ))}
          </div>
        ) : (
          <ReportsTable
            reports={paginatedReports}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onAssign={handleAssign}
            onResolve={() => {}}
            showResolve={false}
            onViewAudit={handleViewAudit}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground hidden sm:inline">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="flex-1 sm:flex-initial"
              >
                <ChevronLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-muted-foreground">...</span>
                    <Button
                      variant={page === totalPages ? "default" : "outline"}
                      size="sm"
                      className="w-8"
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              {/* Mobile page indicator */}
              <div className="sm:hidden text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="flex-1 sm:flex-initial"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        )}
        {/* Modals */}
        <AssignReportModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          report={selectedReport}
          onAssign={handleAssignSubmit}
          isLoading={isAssigning}
        />
      </div>
    </AdminLayout>
  );
}
