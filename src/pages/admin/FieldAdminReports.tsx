// src/pages/admin/FieldAdminReports.tsx - FIXED
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import { useAssignedReports } from '@/hooks/useAssignedReports';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';

export default function FieldAdminReports() {
  const { reports, isLoading } = useAssignedReports();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(search.toLowerCase()) ||
                         report.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'pothole', label: 'Pothole' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'street_maintenance', label: 'Street Maintenance' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground">
            Reports assigned to you for resolution
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Reports</CardTitle>
          <CardDescription>
            {filteredReports.length} report(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
  <ReportsTable 
    reports={filteredReports} 
    isLoading={isLoading}
    selectedIds={[]}
    onSelectionChange={() => {}}
    onAssign={() => {}}
    onResolve={() => {}}
    onViewAudit={() => {}}
    // Add other required props if needed
  />
</CardContent>
      </Card>
    </div>
  );
}