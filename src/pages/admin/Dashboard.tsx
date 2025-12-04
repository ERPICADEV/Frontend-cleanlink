import { FileText, UserCheck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { data: stats, isLoading: loading, error } = useAdminStats();
  
  // Convert reportsByCategory from Record to array
  const reportsByCategoryArray = useMemo(() => {
    if (!stats?.reportsByCategory) return [];
    // Handle both array and Record formats
    if (Array.isArray(stats.reportsByCategory)) {
      return stats.reportsByCategory.map((item: any) => ({
        category: typeof item === 'object' && item !== null ? (item.category || item.name || 'other') : String(item),
        count: typeof item === 'object' && item !== null ? (item.count || item.value || 0) : 0,
      }));
    }
    // Handle Record format
    return Object.entries(stats.reportsByCategory).map(([category, count]) => ({
      category: String(category),
      count: typeof count === 'number' ? count : 0,
    }));
  }, [stats]);

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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6 flex items-center justify-center"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">
              Failed to load stats: {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending Reports"
              value={stats?.pendingReports ?? 0}
              icon={FileText}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
            <StatCard
              title="Assigned to You"
              value={stats?.assignedToYou ?? 0}
              icon={UserCheck}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            <StatCard
              title="Resolved This Month"
              value={stats?.resolvedThisMonth ?? 0}
              icon={CheckCircle2}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
            />
            <StatCard
              title="Avg Resolution Time"
              value={stats?.avgResolutionTime ?? "0 hrs"}
              icon={Clock}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {activity.title || `Report ${activity.status}`}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {activity.id?.slice(0, 12)}...
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.updatedAt
                        ? new Date(activity.updatedAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No recent activity
              </p>
            )}
          </div>

          {/* Reports by Category */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Reports by Category</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : reportsByCategoryArray.length > 0 ? (
              <div className="space-y-3">
                {reportsByCategoryArray.map((item, i: number) => {
                  const maxCount = Math.max(
                    ...reportsByCategoryArray.map((c) => c.count)
                  );
                  const colors = [
                    "bg-red-500",
                    "bg-green-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-orange-500",
                  ];
                  return (
                    <div key={item.category || i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">
                          {item.category?.replace(/_/g, " ") || "Other"}
                        </span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            colors[i % colors.length]
                          } rounded-full transition-all`}
                          style={{
                            width: `${(item.count / maxCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No category data available
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                