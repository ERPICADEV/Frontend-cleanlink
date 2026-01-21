import { useMemo } from "react";
import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { fetchReports, type ReportListResponse } from "@/services/reportService";

export interface ReportsFilters {
  category?: string;
  status?: string;
  sort?: "new" | "hot" | "top";
  reporter_id?: string;
  limit?: number;
}

export const useReports = (
  filters: ReportsFilters = {}
): UseInfiniteQueryResult<InfiniteData<ReportListResponse>, Error> => {
  const normalizedFilters = useMemo(
    () => ({
      category: filters.category || undefined,
      status: filters.status || undefined,
      sort: filters.sort || "new",
      reporter_id: filters.reporter_id || undefined,
      limit: filters.limit || 10,
    }),
    [filters.category, filters.status, filters.sort, filters.reporter_id, filters.limit]
  );

  const queryKey = ["reports", normalizedFilters] as const;

  // Provide explicit generics so the return type is stable (fixes TS inference issues).
  const options: UseInfiniteQueryOptions<
    ReportListResponse,
    Error,
    InfiniteData<ReportListResponse>,
    typeof queryKey,
    string | undefined
  > = {
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      fetchReports({
        ...normalizedFilters,
        cursor: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.paging?.next_cursor ?? undefined,
    staleTime: 30_000, // 30s
    gcTime: 5 * 60_000, // 5m (TanStack Query v5)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 503 (Service Unavailable)
      if (error?.status === 503) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  };

  // Some TS toolchains lag behind TanStack Query option typings.
  // Cast keeps runtime behavior identical while preserving the hook's result typing for callers.
  return useInfiniteQuery(options as any) as UseInfiniteQueryResult<
    InfiniteData<ReportListResponse>,
    Error
  >;
};

