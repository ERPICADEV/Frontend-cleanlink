import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllRewards, createReward, updateReward, deleteReward, CreateRewardPayload, UpdateRewardPayload } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import type { Reward } from "@/types/rewards";

export const useAdminRewards = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all rewards
  const {
    data: rewards = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: fetchAllRewards,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateRewardPayload) => createReward(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] }); // Also invalidate public rewards
      toast({
        title: "Reward created",
        description: "The reward has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error?.response?.data?.error?.message || "Failed to create reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ rewardId, payload }: { rewardId: string; payload: UpdateRewardPayload }) =>
      updateReward(rewardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] }); // Also invalidate public rewards
      toast({
        title: "Reward updated",
        description: "The reward has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error?.response?.data?.error?.message || "Failed to update reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (rewardId: string) => deleteReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] }); // Also invalidate public rewards
      toast({
        title: "Reward deleted",
        description: "The reward has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error?.response?.data?.error?.message || "Failed to delete reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    rewards,
    loading: isLoading,
    error,
    refetch,
    createReward: (payload: CreateRewardPayload) => createMutation.mutateAsync(payload),
    updateReward: (rewardId: string, payload: UpdateRewardPayload) => updateMutation.mutateAsync({ rewardId, payload }),
    deleteReward: (rewardId: string) => deleteMutation.mutateAsync(rewardId),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
