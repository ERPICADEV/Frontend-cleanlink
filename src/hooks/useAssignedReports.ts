// src/hooks/useAssignedReports.ts - UPDATED VERSION
import { useQuery } from '@tanstack/react-query';
import { fetchAssignedReports } from '@/services/adminService';
import type { Report } from '@/types/admin'; 

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

  // Extract reports from the response data
  const reports = queryResult.data?.data || [];

  return {
    ...queryResult,
    reports, // Add the extracted reports for easy access
  };
};