// src/hooks/useAssignedReports.ts - UPDATED VERSION
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchAssignedReports } from '@/services/adminService';
import type { Report, ReportCategory } from '@/types/admin'; 

export const useAssignedReports = (params?: {
  status?: string;
  sort?: string;
  limit?: number;
}) => {
  const queryResult = useQuery({
    queryKey: ['assignedReports', params],
    queryFn: () => fetchAssignedReports(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
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

  // Normalize reports from API response
  const reports: Report[] = useMemo(() => {
    if (!queryResult.data?.data) return [];
    return queryResult.data.data.map((r: any) => ({
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
      assignedTo: r.mcd_verified_by || r.assignedTo || r.assigned_to,
      assignedToName: r.assignedToName || r.assigned_to_name,
      region: r.reporter?.region?.city || r.reporter?.region?.area_name || r.region || "Unknown",
      location: r.location,
      images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : [],
      upvotes: r.upvotes || 0,
      downvotes: r.downvotes || 0,
      communityScore: r.community_score || 0,
      comments_count: r.comments_count || 0,
    }));
  }, [queryResult.data]);

  return {
    ...queryResult,
    reports, // Add the normalized reports for easy access
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  };
};