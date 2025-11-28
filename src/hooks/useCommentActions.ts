import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComment, deleteComment, type ReportComment } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";

interface UseCommentActionsOptions {
  reportId: string;
  onSuccess?: () => void;
}

export const useCommentActions = ({ reportId, onSuccess }: UseCommentActionsOptions) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const editMutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateComment(commentId, text),
    onSuccess: (data, variables) => {
      // Invalidate and refetch report data
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      setIsEditing(null);
      onSuccess?.();
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to update comment. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      // Invalidate and refetch report data
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      setIsDeleting(null);
      onSuccess?.();
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted.",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Failed to delete comment. Please try again.";
      toast({
        title: "Delete failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = async (commentId: string, text: string) => {
    if (!text.trim() || text.length > 1000) {
      toast({
        title: "Invalid comment",
        description: "Comment must be between 1 and 1000 characters.",
        variant: "destructive",
      });
      return;
    }
    editMutation.mutate({ commentId, text });
  };

  const handleDelete = async (commentId: string) => {
    deleteMutation.mutate(commentId);
  };

  return {
    editComment: handleEdit,
    deleteComment: handleDelete,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
    isEditingComment: editMutation.isPending,
    isDeletingComment: deleteMutation.isPending,
    error: editMutation.error || deleteMutation.error,
  };
};

