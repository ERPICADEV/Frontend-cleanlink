import { useQuery } from '@tanstack/react-query';
import { fetchAssignedReports } from '@/services/adminService';

export function useAssignedReports() {
  return useQuery({
    queryKey: ['assignedReports'],
    queryFn: () => fetchAssignedReports(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
