// src/components/admin/FieldAdminLayout.tsx
import { useState } from "react";
import { FieldAdminSidebar } from "./FieldAdminSidebar";
import { AdminHeader } from "./AdminHeaders";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface FieldAdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function FieldAdminLayout({ children, breadcrumbs }: FieldAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="h-screen sticky top-0">
          <FieldAdminSidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <FieldAdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}