// src/pages/admin/FieldAdminReports.tsx - FIXED
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import { useAssignedReports } from '@/hooks/useAssignedReports';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';
import { UpdateProgressModal } from '@/components/admin/modals/UpdateProgressModal';
import { ResolveReportModal } from '@/components/admin/modals/ResolveReportModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReportProgress, submitForApproval, fetchAuditLogs, resolveReport } from '@/services/adminService';
import { uploadImage } from '@/services/reportService';
import { useToast } from '@/hooks/use-toast';
import type { Report, ReportStatus } from '@/types/admin';

export default function FieldAdminReports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { reports, isLoading } = useAssignedReports();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

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

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ reportId, data }: { reportId: string; data: { progress_status?: string; notes?: string; photos?: File[] } }) => {
      // Upload images and convert to URL strings
      const photoUrls = data.photos && data.photos.length
        ? await Promise.all(data.photos.map((file) => uploadImage(file)))
        : [];
      return updateReportProgress(reportId, {
        progress_status: data.progress_status as any,
        notes: data.notes,
        photos: photoUrls.length ? photoUrls : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedReports'] });
      toast({
        title: 'Progress updated',
        description: 'Report progress has been updated successfully.',
      });
      setIsProgressModalOpen(false);
      setSelectedReport(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.error?.message || 'Failed to update progress.',
        variant: 'destructive',
      });
    },
  });

  // Submit for approval mutation
  const submitApprovalMutation = useMutation({
    mutationFn: async ({ reportId, data }: { reportId: string; data: { completion_details: string; photos?: string[] } }) => {
      return submitForApproval(reportId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedReports'] });
      toast({
        title: 'Submitted for approval',
        description: 'Report has been submitted for super admin approval.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.error?.message || 'Failed to submit for approval.',
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleUpdateProgress = (report: Report) => {
    setSelectedReport(report);
    setIsProgressModalOpen(true);
  };

  const handleSubmitProgress = async (data: { progress_status?: string; notes?: string; photos?: File[] }) => {
    if (!selectedReport) return;
    
    // If submitting for approval, use submitForApproval endpoint
    if (data.progress_status === 'submitted_for_approval') {
      const photoUrls = data.photos && data.photos.length
        ? await Promise.all(data.photos.map((file) => uploadImage(file)))
        : [];
      await submitApprovalMutation.mutateAsync({
        reportId: selectedReport.id,
        data: {
          completion_details: data.notes || 'Work completed',
          photos: photoUrls.length ? photoUrls : undefined,
        },
      });
    } else {
      await updateProgressMutation.mutateAsync({
        reportId: selectedReport.id,
        data,
      });
    }
  };

  const handleViewAudit = async (reportId: string) => {
    try {
      const logs = await fetchAuditLogs(reportId);
      // Navigate to audit logs page or show modal
      navigate(`/field-admin/reports/${reportId}/audit`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load audit logs.',
        variant: 'destructive',
      });
    }
  };

  const handleResolve = (report: Report) => {
    setSelectedReport(report);
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (
    reportId: string,
    status: ReportStatus,
    details: string,
    duplicateId?: string
  ) => {
    try {
      // Backend requires cleaned_image_url, so we'll use a placeholder for now
      // In production, this should come from the image upload in the modal
      await resolveReport(reportId, {
        cleaned_image_url: "https://placeholder.com/after.jpg", // TODO: Get from modal upload
        notes: details,
        status: status === "resolved" ? "resolved" : status === "duplicate" ? "duplicate" : "cannot_fix",
      });
      queryClient.invalidateQueries({ queryKey: ['assignedReports'] });
      toast({
        title: 'Report resolved',
        description: 'Report has been resolved successfully.',
      });
      setIsResolveModalOpen(false);
      setSelectedReport(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.error?.message || 'Failed to resolve report.',
        variant: 'destructive',
      });
    }
  };

  const handleAssign = () => {
    // Field admins can't assign reports
    toast({
      title: 'Not available',
      description: 'Only super admins can assign reports.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reports</h1>
          <p className="text-muted-foreground">
            Reports assigned to you for resolution
          </p>
        </div>
       
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
            onAssign={handleAssign}
            onResolve={handleResolve}
            onViewAudit={handleViewAudit}
            showAssign={false}
          />
        </CardContent>
      </Card>

      {/* Update Progress Modal */}
      {selectedReport && (
        <UpdateProgressModal
          open={isProgressModalOpen}
          onOpenChange={setIsProgressModalOpen}
          reportId={selectedReport.id}
          currentStatus={selectedReport.status === 'assigned' ? 'not_started' : selectedReport.status === 'in_progress' ? 'in_progress' : 'not_started'}
          onSubmit={handleSubmitProgress}
          isSubmitting={updateProgressMutation.isPending || submitApprovalMutation.isPending}
        />
      )}

      {/* Resolve Report Modal */}
      <ResolveReportModal
        open={isResolveModalOpen}
        onOpenChange={setIsResolveModalOpen}
        report={selectedReport}
        onResolve={handleResolveSubmit}
        isLoading={false}
      />
    </div>
  );
}