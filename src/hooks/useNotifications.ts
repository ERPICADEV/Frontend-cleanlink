import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Notification, NotificationsResponse } from "@/types/notifications";

const NOTIFICATIONS_PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
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
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      // Backend returns { count: number }
      const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count");
      return data.count;
    },
    refetchInterval: POLL_INTERVAL_MS,
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
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
};


