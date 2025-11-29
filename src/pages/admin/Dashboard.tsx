import { FileText, UserCheck, CheckCircle2, Clock } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import type { DashboardStats } from "@/types/admin";

// Mock stats data
const mockStats: DashboardStats = {
  pendingReports: 24,
  assignedToYou: 8,
  resolvedThisMonth: 156,
  avgResolutionTime: "2.4 days",
};

export default function AdminDashboard() {
  return (
    <AdminLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of reports and admin activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pending Reports"
            value={mockStats.pendingReports}
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard
            title="Assigned to You"
            value={mockStats.assignedToYou}
            icon={UserCheck}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Resolved This Month"
            value={mockStats.resolvedThisMonth}
            icon={CheckCircle2}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Avg Resolution Time"
            value={mockStats.avgResolutionTime}
            icon={Clock}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: "Report assigned", target: "RPT-a1b2c3", time: "2 min ago" },
                { action: "Report resolved", target: "RPT-d4e5f6", time: "15 min ago" },
                { action: "New report flagged", target: "RPT-g7h8i9", time: "1 hour ago" },
                { action: "Comment added", target: "RPT-j0k1l2", time: "2 hours ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {activity.target}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reports by Category */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Reports by Category</h2>
            <div className="space-y-3">
              {[
                { category: "Pothole", count: 45, color: "bg-red-500" },
                { category: "Garbage", count: 32, color: "bg-green-500" },
                { category: "Flooding", count: 18, color: "bg-blue-500" },
                { category: "Street Maintenance", count: 24, color: "bg-purple-500" },
                { category: "Traffic", count: 15, color: "bg-orange-500" },
              ].map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${(item.count / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                