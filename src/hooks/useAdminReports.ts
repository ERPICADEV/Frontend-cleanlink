import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminReports, assignReport, resolveReport, type AssignReportPayload, type ResolveReportPayload } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import type { Report, ReportsFilter, ReportCategory } from "@/types/admin";

export const useAdminReports = (initialFilters?: Partial<ReportsFilter>) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportsFilter>({
    search: "",
    status: initialFilters?.status || "all",
    category: initialFilters?.category || "all",
    region: initialFilters?.region || "all",
    sortBy: initialFilters?.sortBy || "newest",
  });

  // Fetch reports
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-reports", filters],
    queryFn: () =>
      fetchAdminReports({
        status: filters.status,
        category: filters.category,
        region: filters.region,
        sort: filters.sortBy === "newest" ? "new" : filters.sortBy === "oldest" ? "old" : "priority",
        limit: 100, // Fetch more for client-side pagination
      }),
    enabled: true,
  });

  // Normalize category to match our types
  const normalizeCategory = (cat: string): ReportCategory => {
    const normalized = cat?.toLowerCase().replace(/\s+/g, '_');
    const validCategories: ReportCategory[] = ['pothole', 'garbage', 'flooding', 'street_maintenance', 'traffic', 'other'];
    if (validCategories.includes(normalized as ReportCategory)) {
      return normalized as ReportCategory;
    }
    // Map common variations
    const categoryMap: Record<string, ReportCategory> = {
      'streetlight': 'street_maintenance',
      'water': 'flooding',
      'sewage': 'flooding',
      'road': 'street_maintenance',
    };
    return categoryMap[normalized] || 'other';
  };

  const reports: Report[] = useMemo(() => {
    if (!reportsData?.data) return [];
    return reportsData.data.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      category: normalizeCategory(r.category || "other"),
      status: r.status || "pending",
      reporterId: r.reporter?.id || "",
      reporterName: r.reporter?.username || "Anonymous",
      severity: r.ai_score?.severity ? Math.round(r.ai_score.severity * 5) : undefined,
      aiScore: r.ai_score ? (typeof r.ai_score === 'string' ? JSON.parse(r.ai_score) : r.ai_score) : undefined,
      createdAt: r.created_at || r.createdAt,
      updatedAt: r.updated_at || r.updatedAt,
      assignedTo: r.mcd_verified_by || r.assignedTo,
      assignedToName: r.assignedToName,
      region: r.reporter?.region?.city || r.reporter?.region?.area_name || r.region || "Unknown",
      location: r.location,
      images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : [],
      upvotes: r.upvotes || 0,
      downvotes: r.downvotes || 0,
      communityScore: r.community_score || 0,
      comments_count: r.comments_count || 0,
    }));
  }, [reportsData]);

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ reportId, payload }: { reportId: string; payload: AssignReportPayload }) =>
      assignReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({
        title: "Report assigned",
        description: "The report has been assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error?.response?.data?.error?.message || "Failed to assign report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: ({ reportId, payload }: { reportId: string; payload: ResolveReportPayload }) =>
      resolveReport(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({
        title: "Report resolved",
        description: "The report has been marked as resolved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Resolution failed",
        description: error?.response?.data?.error?.message || "Failed to resolve report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssign = async (reportId: string, payload: AssignReportPayload) => {
    await assignMutation.mutateAsync({ reportId, payload });
  };

  const handleResolve = async (reportId: string, payload: ResolveReportPayload) => {
    await resolveMutation.mutateAsync({ reportId, payload });
  };

  return {
    reports,
    loading: isLoading,
    error,
    filters,
    setFilters,
    pagination: {
      page: 1,
      pageSize: 20,
      total: reports.length,
    },
    assignReport: handleAssign,
    resolveReport: handleResolve,
    isAssigning: assignMutation.isPending,
    isResolving: resolveMutation.isPending,
    refreshing: isFetching,
    refetch,
  };
};

