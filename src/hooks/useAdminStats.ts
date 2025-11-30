import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '@/services/adminService';

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
