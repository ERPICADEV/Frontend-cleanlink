import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  FileText, 
  ScrollText, 
  BarChart3, 
  CheckSquare,
  ArrowLeft,
  Settings as SettingsIcon,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  url: string;
  icon: any;
  end?: boolean;
  disabled?: boolean;
}


const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Rewards", url: "/admin/rewards", icon: Gift },
  { title: "Pending Approvals", url: "/admin/approvals", icon: CheckSquare },
  // Example disabled item:
  // { title: "Audit Logs", url: "/admin/logs", icon: ScrollText, disabled: true },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: SettingsIcon },
];


export function AdminSidebar({ collapsed = false }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src="/favicon.ico" 
            alt="CleanLink Logo" 
            className="w-8 h-8 flex-shrink-0"
          />
          {!collapsed && (
            <span className="font-semibold text-lg">Admin Panel</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "text-sidebar-foreground/30 cursor-not-allowed opacity-50"
                )}
                title="Coming soon"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </div>
            );
          }
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.end}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-foreground border-l-4 border-primary -ml-0.5 pl-2.5"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to App */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          {!collapsed && <span>Back to App</span>}
        </NavLink>
      </div>
    </aside>
  );
}
