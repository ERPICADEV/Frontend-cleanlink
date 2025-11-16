import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Bell, MessageSquare, Award, CheckCircle } from "lucide-react";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "comment",
      icon: MessageSquare,
      title: "New comment on your report",
      message: "Someone commented on 'Garbage pile near Park Street'",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "status",
      icon: CheckCircle,
      title: "Report resolved",
      message: "Your report 'Large pothole on MG Road' has been marked as resolved",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "reward",
      icon: Award,
      title: "Civic Points earned!",
      message: "You earned 50 points for a resolved report",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      type: "comment",
      icon: MessageSquare,
      title: "New comment on your report",
      message: "MCD official commented on 'Street light issue'",
      time: "2 days ago",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        <div className="space-y-1">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                  !notification.read ? "bg-accent/30 border-primary/20" : "border-separator"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 rounded-full ${!notification.read ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-4 h-4 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm mb-1 ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
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
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
