// src/pages/admin/FieldAdminDashboard.tsx - FIXED
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import { useAssignedReports } from '@/hooks/useAssignedReports';
import { formatDistanceToNow } from 'date-fns';


const getRelativeTime = (timestamp?: string) => {
  if (!timestamp) return "Recently";
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }
  return formatDistanceToNow(parsed, { addSuffix: true });
};

export default function FieldAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  
  const { reports, isLoading: isLoadingReports } = useAssignedReports();

  const assignedCount = reports?.length ?? 0;
  const pendingTasksCount = reports?.filter(r => ['assigned', 'in_progress'].includes(r.status)).length ?? 0;

  const now = new Date();
  const resolvedThisMonthCount = reports?.filter(r => {
    if (r.status !== 'resolved' || !r.updatedAt) return false;
    const updated = new Date(r.updatedAt);
    if (Number.isNaN(updated.getTime())) return false;
    const diffDays = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length ?? 0;

  const avgResolutionTime = useMemo(() => {
    const resolved = reports?.filter(r => r.status === 'resolved' && r.createdAt && r.updatedAt) ?? [];
    if (!resolved.length) return "N/A";

    const durations = resolved
      .map(r => {
        const created = new Date(r.createdAt);
        const updated = new Date(r.updatedAt);
        if (Number.isNaN(created.getTime()) || Number.isNaN(updated.getTime())) return null;
        return updated.getTime() - created.getTime();
      })
      .filter((d): d is number => d !== null);

    if (!durations.length) return "N/A";

    const avgMs = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const avgDate = new Date(now.getTime() - avgMs);
    return formatDistanceToNow(avgDate, { addSuffix: false });
  }, [reports]);
  
  const recentReports = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    return [...reports]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [reports]);

  const statsCards = [
    {
      title: 'Assigned to You',
      value: assignedCount,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: 'Reports currently assigned to you',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasksCount,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      description: 'Assigned reports waiting on you',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Resolved This Month',
      value: resolvedThisMonthCount,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      description: 'Reports you helped resolve',
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Avg Resolution Time',
      value: avgResolutionTime,
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      description: 'Average time from assign to resolve',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Field Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Track and complete the reports assigned to you
        </p>
      </div>

      <Tabs defaultValue="overview" onValueChange={(v) => setActiveTab(v as 'overview' | 'reports')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Overview</h2>
          </div>
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Quick Actions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-full`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingReports ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your reports</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="mt-1">
                        {report.status === 'resolved' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : report.status === 'pending_approval' ? (
                          <AlertCircle className="h-4 w-4 text-purple-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {report.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(report.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {report.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to your most common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="default" 
                className="w-full justify-start"
                onClick={() => navigate('/field-admin/reports')}
              >
                <FileText className="mr-2 h-4 w-4" />
                View My Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/profile')}
              >
                <Users className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}