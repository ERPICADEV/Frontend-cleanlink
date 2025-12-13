import { Bell, HelpCircle, Settings, LogOut, Menu, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminHeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function AdminHeader({
  breadcrumbs = [{ label: "Dashboard" }],
  onMenuClick,
  notificationCount = 0,
}: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { adminRegion } = useAdmin();
  
  const adminName = user?.username || user?.email || "Admin";
  const region = adminRegion || (user?.region && typeof user.region === 'object' && 'city' in user.region ? String(user.region.city) : null) || "Unknown";
  return (
    <TooltipProvider>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
        {/* Left: Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onMenuClick}
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle menu</p>
            </TooltipContent>
          </Tooltip>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Right: Admin Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin Mode Badge */}
        <Badge
          variant="outline"
          className="hidden sm:flex bg-admin-badge text-admin-badge-foreground border-admin-badge-border gap-1.5 px-2.5 py-1"
        >
          <span className="text-xs">🔐</span>
          <span className="font-medium text-xs">ADMIN MODE</span>
        </Badge>

        {/* Admin Info */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="font-medium">{adminName}</span>
          <span className="text-muted-foreground">({region})</span>
        </div>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 99 ? "99+" : String(notificationCount)}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notifications</p>
          </TooltipContent>
        </Tooltip>

        {/* Help */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Help & Support">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help & Support</p>
          </TooltipContent>
        </Tooltip>

        {/* User Menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {adminName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>User menu</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="font-medium">{adminName}</p>
              <p className="text-sm text-muted-foreground">{region} Region</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center w-full">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </TooltipProvider>
  );
}
