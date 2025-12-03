// src/components/admin/FieldAdminSidebar.tsx
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare,
  ArrowLeft,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldAdminSidebarProps {
  collapsed?: boolean;
}

const fieldAdminNavItems = [
  { title: "Dashboard", url: "/field-admin", icon: LayoutDashboard, end: true },
  { title: "My Reports", url: "/field-admin/reports", icon: FileText },
  { title: "Pending Approvals", url: "/field-admin/approvals", icon: CheckSquare },
];

export function FieldAdminSidebar({ collapsed = false }: FieldAdminSidebarProps) {
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
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg">Field Admin</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {fieldAdminNavItems.map((item) => (
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
        ))}
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