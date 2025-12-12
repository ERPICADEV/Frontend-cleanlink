import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Notification, NotificationsResponse } from "@/types/notifications";
import { useAuth } from "@/contexts/AuthContext";

const NOTIFICATIONS_PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 30_000;

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

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
    refetchInterval: isAuthenticated ? POLL_INTERVAL_MS : false,
    enabled: isAuthenticated, // Only fetch when authenticated
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
    refetchInterval: isAuthenticated ? POLL_INTERVAL_MS : false,
    enabled: isAuthenticated, // Only fetch when authenticated
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
      await queryClient.cancelQueries({ queryKey: ["notifications-unread-count"] });

      // Snapshot previous values
      const previousNotificationsData = queryClient.getQueriesData({ queryKey: ["notifications"] });
      const previousUnreadCount = queryClient.getQueryData<number>(["notifications-unread-count"]);

      // Check if the notification is currently unread before updating
      let wasUnread = false;
      let notificationFound = false;
      
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (old: any) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: NotificationsResponse) => ({
              ...page,
              data: page.data.map((notif) => {
                if (notif.id === notificationId) {
                  notificationFound = true;
                  wasUnread = !notif.isRead;
                  return { ...notif, isRead: true };
                }
                return notif;
              }),
            })),
          };
        }
      );

      // Optimistically update unread count
      // Always decrement if we're marking as read, unless we know it was already read
      if (previousUnreadCount !== undefined && previousUnreadCount > 0) {
        if (notificationFound) {
          // Notification found in cache
          if (wasUnread) {
            // Was unread, so decrement
            queryClient.setQueryData<number>(
              ["notifications-unread-count"],
              Math.max(0, previousUnreadCount - 1)
            );
          }
          // If was already read, don't change count
        } else {
          // Notification not in cache - assume it was unread and decrement optimistically
          // This handles cases where notification is on a different page
          queryClient.setQueryData<number>(
            ["notifications-unread-count"],
            Math.max(0, previousUnreadCount - 1)
          );
        }
      }

      return { previousNotificationsData, previousUnreadCount };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotificationsData) {
        context.previousNotificationsData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(["notifications-unread-count"], context.previousUnreadCount);
      }
    },
    onSuccess: async (data, notificationId) => {
      // Immediately refetch unread count to ensure accuracy
      // Use refetchQueries with exact: false to catch all related queries
      await queryClient.refetchQueries({ 
        queryKey: ["notifications-unread-count"],
        exact: false 
      });
      
      // Also recalculate from notifications cache as a fallback
      const notificationsData = queryClient.getQueriesData({ queryKey: ["notifications"] });
      if (notificationsData && notificationsData.length > 0) {
        const [, notificationsCache] = notificationsData[0];
        if (notificationsCache && (notificationsCache as any).pages) {
          const allNotifications = (notificationsCache as any).pages.flatMap(
            (page: NotificationsResponse) => page.data || []
          );
          const unreadCount = allNotifications.filter((n: Notification) => !n.isRead).length;
          // Only update if we have notifications in cache and count is reasonable
          if (allNotifications.length > 0) {
            queryClient.setQueryData<number>(
              ["notifications-unread-count"],
              unreadCount
            );
          }
        }
      }
    },
    onSettled: async () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Force refetch with exact: false to catch all variations
      await queryClient.refetchQueries({ 
        queryKey: ["notifications-unread-count"],
        exact: false 
      });
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


