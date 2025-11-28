import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReport, type ReportDetail, type ReportUpdateData } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";

interface UseReportActionsOptions {
  reportId: string;
  onSuccess?: () => void;
}

export const useReportActions = ({ reportId, onSuccess }: UseReportActionsOptions) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: (updates: ReportUpdateData) => updateReport(reportId, updates),
    onSuccess: () => {
      // Invalidate and refetch report data
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      onSuccess?.();
      toast({
        title: "Report updated",
        description: "Your report has been updated successfully.",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to update report. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = async (updates: ReportUpdateData) => {
    // Validation
    if (updates.title !== undefined) {
      if (!updates.title.trim() || updates.title.length < 10 || updates.title.length > 200) {
        toast({
          title: "Invalid title",
          description: "Title must be between 10 and 200 characters.",
          variant: "destructive",
        });
        return;
      }
    }

    if (updates.description !== undefined) {
      if (
        !updates.description.trim() ||
        updates.description.length < 20 ||
        updates.description.length > 2000
      ) {
        toast({
          title: "Invalid description",
          description: "Description must be between 20 and 2000 characters.",
          variant: "destructive",
        });
        return;
      }
    }

    updateMutation.mutate(updates);
  };

  return {
    updateReport: handleUpdate,
    isUpdating: updateMutation.isPending,
    error: updateMutation.error,
  };
};

