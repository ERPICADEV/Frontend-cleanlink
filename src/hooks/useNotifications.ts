import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Notification, NotificationsResponse } from "@/types/notifications";

const NOTIFICATIONS_PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = {
        limit: NOTIFICATIONS_PAGE_SIZE,
      };
      if (pageParam) {
        params.cursor = pageParam;
      }

      const { data } = await apiClient.get<NotificationsResponse>("/notifications", {
        params,
      });

      return data;
    },
    getNextPageParam: (lastPage) => lastPage.paging?.next_cursor ?? undefined,
    refetchInterval: POLL_INTERVAL_MS,
    // Don't throw errors for 401 - user might not be logged in
    throwOnError: false,
    // Return empty data on 401 errors
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      // Backend returns { count: number }
      const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count");
      return data.count;
    },
    refetchInterval: POLL_INTERVAL_MS,
    // Don't throw errors for 401 - user might not be logged in
    throwOnError: false,
    // Return 0 on 401 errors
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    // Return 0 if there's an error (user not logged in)
    select: (data) => data ?? 0,
  });

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.patch<{ id: string; isRead: boolean }>(
        `/notifications/${notificationId}/read`
      );
      return data;
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot previous value for infinite query
      const previousData = queryClient.getQueriesData({ queryKey: ["notifications"] });

      // Optimistically update the infinite query cache
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old: any) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: NotificationsResponse) => ({
              ...page,
              data: page.data.map((notif) =>
                notif.id === notificationId ? { ...notif, isRead: true } : notif
              ),
            })),
          };
        }
      );

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const notifications: Notification[] =
    notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    notifications,
    unreadCount: unreadCountQuery.data ?? 0,
    loading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
    error: notificationsQuery.error || unreadCountQuery.error,
    fetchNextPage: notificationsQuery.fetchNextPage,
    hasNextPage: notificationsQuery.hasNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    markAsRead: (notificationId: string) => markAsReadMutation.mutate(notificationId),
    isMarkingAsRead: markAsReadMutation.isPending,
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
};


