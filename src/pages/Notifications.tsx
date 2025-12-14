import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Bell, MessageSquare, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelative } from "date-fns";

const Notifications = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.data) {
      // Handle report-related notifications
      if (notification.data.reportId) {
        navigate(`/post/${notification.data.reportId}`);
        return;
      }
      // Handle comment-related notifications
      if (notification.data.commentId && notification.data.reportId) {
        navigate(`/post/${notification.data.reportId}`);
        return;
      }
      // Handle reward-related notifications
      if (notification.type === "reward" && notification.data.rewardId) {
        navigate("/rewards");
        return;
      }
    }

    // For other notification types, just mark as read (no navigation)
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="w-5 h-5" />;
      case "status":
        return <Bell className="w-5 h-5" />;
      case "reward":
        return <Award className="w-5 h-5" />;
      case "verification":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "comment":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950";
      case "status":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950";
      case "reward":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
      case "verification":
        return "text-green-500 bg-green-50 dark:bg-green-950";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-sm text-destructive">
          Failed to load notifications. Please try again.
        </div>
      );
    }

    if (!notifications.length) {
      return (
        <div className="p-8 text-center text-muted-foreground text-sm">
          You&apos;re all caught up. No notifications yet.
        </div>
      );
    }

    return (
      <>
        <div className="divide-y divide-border">
          {notifications.map((notification) => {
            const createdAt = notification.createdAt
              ? formatRelative(new Date(notification.createdAt), new Date())
              : "";

            const type =
              notification.type === "report_resolved" ||
              notification.type === "level_up" ||
              notification.type === "points_earned"
                ? notification.type
                : "status";

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                  !notification.isRead && "bg-accent/30"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getIconColor(type)
                    )}
                  >
                    {getIcon(type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    {createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {createdAt}
                      </span>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {hasNextPage && (
          <button
            className="w-full py-3 text-sm text-primary hover:underline disabled:opacity-50"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load more"}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
            <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold">Notifications</h1>
              {notifications.length > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
                </button>
              )}
            </div>
              {renderContent()}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
