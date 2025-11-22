import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Bell, MessageSquare, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "comment" | "status" | "reward" | "verification";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "comment",
    title: "New comment on your post",
    message: "Someone commented on 'Overflowing garbage bins near Park Street'",
    time: "5 mins ago",
    read: false,
  },
  {
    id: "2",
    type: "status",
    title: "Issue status updated",
    message: "Your report 'Large pothole causing traffic' is now In Process",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "reward",
    title: "Points earned!",
    message: "You earned +50 Civic Points for your resolved report",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "verification",
    title: "Community verified your post",
    message: "Your post has been verified by the community",
    time: "5 hours ago",
    read: true,
  },
];

const Notifications = () => {
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

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            
            <div className="divide-y divide-border">
              {dummyNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                    !notification.read && "bg-accent/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      getIconColor(notification.type)
                    )}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
