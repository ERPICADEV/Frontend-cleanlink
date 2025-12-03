import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchPendingApprovals,
  approveReport,
  rejectReport,
  type PendingApproval,
} from "@/services/adminService";

export const usePendingApprovals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: () => fetchPendingApprovals({ limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (reportId: string) => approveReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast({
        title: "Work approved",
        description: "The report has been marked as resolved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description:
          error?.response?.data?.error?.message ||
          "Failed to approve work. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string; reason: string }) =>
      rejectReport(reportId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast({
        title: "Work rejected",
        description: "The report has been sent back for revision.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection failed",
        description:
          error?.response?.data?.error?.message ||
          "Failed to reject work. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approvals: PendingApproval[] = query.data?.data || [];

  return {
    approvals,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    approve: (reportId: string) => approveMutation.mutate(reportId),
    reject: (reportId: string, reason: string) =>
      rejectMutation.mutate({ reportId, reason }),
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};

