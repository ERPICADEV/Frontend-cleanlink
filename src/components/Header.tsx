import { Bell, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useNotifications } from "@/hooks/useNotifications";

const Header = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const showBadge = (unreadCount ?? 0) > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">CleanLink</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="w-5 h-5" />
            {showBadge && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] leading-none px-1.5 py-0.5 min-w-[16px]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => navigate("/profile")}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
