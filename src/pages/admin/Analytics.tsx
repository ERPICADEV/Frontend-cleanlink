import { AdminLayout } from "@/components/admin/AdminLayout";
import { BarChart3, TrendingUp, Users, MapPin, Loader2 } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminReports } from "@/hooks/useAdminReports";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";

export default function AdminAnalytics() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { reports, loading: reportsLoading } = useAdminReports();

  // Calculate resolution rate
  const resolutionRate = useMemo(() => {
    if (!stats) return 0;
    const total = stats.pendingReports + stats.resolvedThisMonth;
    if (total === 0) return 0;
    return Math.round((stats.resolvedThisMonth / total) * 100);
  }, [stats]);

  // Calculate reports by category from stats
  const reportsByCategory = useMemo(() => {
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
          <p className="text-sm text-muted-foreground">
            Detailed insights and metrics for your region.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Reports Over Time - Placeholder for future chart */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Reports Over Time</CardTitle>
                <CardDescription>Track reporting volume trends.</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl bg-muted/40">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization coming soon
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Total reports: {reports?.length || 0}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution Rate */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Resolution Rate</CardTitle>
                <CardDescription>Your team&apos;s performance this month.</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="py-3 text-center">
                    <p className="text-5xl font-bold text-foreground">{resolutionRate}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resolution rate this month
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {stats?.resolvedThisMonth || 0} resolved / {stats?.pendingReports || 0} pending
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${resolutionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports by Category */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Reports by Category</CardTitle>
                <CardDescription>See where residents are reporting the most.</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-full bg-muted" />
                  ))}
                </div>
              ) : reportsByCategory.length > 0 ? (
                <div className="space-y-3">
                  {reportsByCategory.map((item: any, i: number) => {
                    const maxCount = Math.max(...reportsByCategory.map((c: any) => c.count));
                    const colors = [
                      "bg-red-500",
                      "bg-emerald-500",
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
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${colors[i % colors.length]} transition-all`}
                            style={{ width: `${(item.count / maxCount) * 100 || 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No category data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Reporters */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Top Active Reporters</CardTitle>
                <CardDescription>Residents who report issues most often.</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-full bg-muted" />
                  ))}
                </div>
              ) : topReporters.length > 0 ? (
                <div className="space-y-3">
                  {topReporters.map((user, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center text-sm">{user.badge || i + 1}</span>
                        <span className="max-w-[10rem] truncate text-sm font-medium md:max-w-none">
                          {user.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {user.count} {user.count === 1 ? "report" : "reports"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No reporter data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reports by Region */}
          <Card className="border-none shadow-sm md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Reports by Region</CardTitle>
                <CardDescription>Understand which areas need the most attention.</CardDescription>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-full bg-muted" />
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
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No region data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
