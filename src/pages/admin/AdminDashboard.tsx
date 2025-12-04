import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Clock, FileText, Users, AlertTriangle } from 'lucide-react';
import { useAssignedReports } from '@/hooks/useAssignedReports';
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdmin } from '@/hooks/useAdmin';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';
import { formatDistanceToNow } from 'date-fns';

type TabType = 'overview' | 'reports' | 'profile';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { user } = useAdmin();
  
  // Fetch admin stats and assigned reports
  const { data: stats, isLoading: isLoadingStats } = useAdminStats();
  const { reports, isLoading: isLoadingReports } = useAssignedReports();
  
  // Get recent activity (last 5 reports)
  const recentReports = useMemo(() => {
    if (!reports) return [];
    return [...reports]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [reports]);

  // Quick stats cards
  const statsCards = [
    {
      title: 'Assigned to You',
      value: stats?.assignedToYou ?? 0,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: 'Reports assigned to you',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'In Progress',
      value: reports?.filter(r => r.status === 'in_progress').length ?? 0,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      description: 'Reports in progress',
      color: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Pending Approval',
      value: reports?.filter(r => r.status === 'pending_approval').length ?? 0,
      icon: <AlertCircle className="h-5 w-5 text-purple-500" />,
      description: 'Waiting for approval',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Resolved (30d)',
      value: stats?.resolvedThisMonth ?? 0,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      description: 'Reports resolved this month',
      color: 'bg-green-100 text-green-800',
    },
  ];

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <Tabs defaultValue="overview" onValueChange={(v) => setActiveTab(v as TabType)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.username || user?.email || 'Admin'}!
            </p>
          </div>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">My Reports</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
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
                  <div className={stat.color + ' p-2 rounded-full'}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
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
                      <div key={report.id} className="flex items-start gap-3">
                        <div className="mt-1">
                          {report.status === 'resolved' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : report.status === 'invalid' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
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
                              {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Status: <Badge variant="outline">{report.status.replace('_', ' ')}</Badge>
                          </p>
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/reports/assigned')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View My Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/reports/create')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/profile')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Reports</CardTitle>
              <CardDescription>
                Reports that have been assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : reports && reports.length > 0 ? (
                <ReportsTable 
                  reports={reports}
                  selectedIds={[]}
                  onSelectionChange={() => {}}
                  onAssign={() => {}}
                  onResolve={(report) => navigate(`/admin/reports/${report.id}/resolve`)}
                  onViewAudit={(id) => navigate(`/admin/audit/${id}`)}
                  showAssign={false}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No reports assigned to you</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You don't have any reports assigned to you yet.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => navigate('/admin/reports')}>
                      View All Reports
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                Update your profile information and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Name</h4>
                  <p className="text-muted-foreground">{user?.username || user?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Email</h4>
                  <p className="text-muted-foreground">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Role</h4>
                  <p className="text-muted-foreground capitalize">
                    {user?.role?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => navigate('/admin/settings')}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
