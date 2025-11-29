import { AdminLayout } from "@/components/admin/AdminLayout";
import { BarChart3, TrendingUp, Users, MapPin } from "lucide-react";

export default function AdminAnalytics() {
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

        {/* Coming Soon State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reports Over Time */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Reports Over Time</h3>
            </div>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Chart visualization coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Resolution Rate</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-foreground">87%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Average resolution rate this month
                </p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "87%" }} />
              </div>
            </div>
          </div>

          {/* Top Reporters */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Top Active Reporters</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "John Doe", reports: 24, badge: "🥇" },
                { name: "Jane Smith", reports: 18, badge: "🥈" },
                { name: "Amit Patel", reports: 15, badge: "🥉" },
                { name: "Priya Singh", reports: 12 },
                { name: "Rajesh Kumar", reports: 10 },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{user.badge || i + 1}</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.reports} reports
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reports by Region */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">Reports by Region</h3>
            </div>
            <div className="space-y-3">
              {[
                { region: "Delhi", count: 156, percent: 35 },
                { region: "Mumbai", count: 124, percent: 28 },
                { region: "Bangalore", count: 98, percent: 22 },
                { region: "Chennai", count: 67, percent: 15 },
              ].map((item) => (
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
