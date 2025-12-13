import { Bell, User, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const Header = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isAdmin, isSuperAdmin } = useAdmin();

  const showBadge = (unreadCount ?? 0) > 0;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center justify-between px-3 sm:px-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img 
              src="/favicon.ico" 
              alt="CleanLink Logo" 
              className="w-8 h-8 flex-shrink-0"
            />
            <span className="text-lg font-bold">CleanLink</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => navigate(isSuperAdmin ? "/admin" : "/field-admin")}
                    aria-label={isSuperAdmin ? "Admin Dashboard" : "Field Admin Dashboard"}
                  >
                    <Shield className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSuperAdmin ? "Admin Dashboard" : "Field Admin Dashboard"}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full relative"
                  onClick={() => navigate("/notifications")}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] leading-none px-1.5 py-0.5 min-w-[16px]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => navigate("/settings")}
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => navigate("/profile")}
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
