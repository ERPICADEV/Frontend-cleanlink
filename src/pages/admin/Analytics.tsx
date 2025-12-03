import { AdminLayout } from "@/components/admin/AdminLayout";
import { BarChart3, TrendingUp, Users, MapPin, Loader2 } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminReports } from "@/hooks/useAdminReports";
import { useMemo } from "react";

export default function AdminAnalytics() {
  const { stats, loading: statsLoading } = useAdminStats();
  const { reports, loading: reportsLoading } = useAdminReports();

  // Calculate resolution rate
  const resolutionRate = useMemo(() => {
    if (!stats) return 0;
    const total = stats.pendingReports + stats.resolvedThisMonth;
    if (total === 0) return 0;
    return Math.round((stats.resolvedThisMonth / total) * 100);
  }, [stats]);

  // Calculate reports by category from stats
  const reportsByCategory = stats?.reportsByCategory || [];

  // Calculate top reporters from reports data
  const topReporters = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    const reporterCounts = new Map<string, { name: string; count: number }>();
    
    reports.forEach((report) => {
      const name = report.reporterName || "Anonymous";
      const current = reporterCounts.get(name) || { name, count: 0 };
      reporterCounts.set(name, { name, count: current.count + 1 });
    });

    return Array.from(reporterCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((reporter, i) => ({
        ...reporter,
        badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : undefined,
      }));
  }, [reports]);

  // Calculate reports by region
  const reportsByRegion = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    const regionCounts = new Map<string, number>();
    
    reports.forEach((report) => {
      const region = report.region || "Unknown";
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    });

    const total = reports.length;
    return Array.from(regionCounts.entries())
      .map(([region, count]) => ({
        region,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reports]);

  const loading = statsLoading || reportsLoading;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Analytics" },
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights and metrics for your region
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reports Over Time - Placeholder for future chart */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Reports Over Time</h3>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chart visualization coming soon
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total reports: {reports?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Rate */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Resolution Rate</h3>
            </div>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-foreground">{resolutionRate}%</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Resolution rate this month
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats?.resolvedThisMonth || 0} resolved / {stats?.pendingReports || 0} pending
                  </p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reports by Category */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Reports by Category</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : reportsByCategory.length > 0 ? (
              <div className="space-y-3">
                {reportsByCategory.map((item: any, i: number) => {
                  const maxCount = Math.max(...reportsByCategory.map((c: any) => c.count));
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
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all`}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No category data available
              </p>
            )}
          </div>

          {/* Top Reporters */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold">Top Active Reporters</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bgcolor-muted animate-pulse rounded" />
                ))}
              </div>
            ) : topReporters.length > 0 ? (
              <div className="space-y-3">
                {topReporters.map((user, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center">{user.badge || i + 1}</span>
                      <span className="font-medium truncate">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {user.count} {user.count === 1 ? "report" : "reports"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reporter data available
              </p>
            )}
          </div>

          {/* Reports by Region */}
          <div className="bg-card rounded-xl border border-border p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Reports by Region</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : reportsByRegion.length > 0 ? (
              <div className="space-y-3">
                {reportsByRegion.map((item) => (
                  <div key={item.region} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.region}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No region data available
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
