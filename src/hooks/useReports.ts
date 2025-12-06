import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchReports, type ReportListResponse } from "@/services/reportService";

export interface ReportsFilters {
  category?: string;
  status?: string;
  sort?: "new" | "hot" | "top";
  reporter_id?: string;
  limit?: number;
}

export const useReports = (filters: ReportsFilters = {}) => {
  const normalizedFilters = useMemo(
    () => ({ ...filters }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(filters)]
  );

  return useInfiniteQuery<ReportListResponse>({
    queryKey: ["reports", normalizedFilters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchReports({
        ...normalizedFilters,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.paging?.next_cursor ?? undefined,
    retry: (failureCount, error: any) => {
      // Don't retry on 503 (Service Unavailable)
      if (error?.status === 503) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });
};

