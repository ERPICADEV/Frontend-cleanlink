import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Reward, Redemption } from "@/types/rewards";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UseRewardsResult {
  rewards: Reward[];
  loading: boolean;
  error: unknown;
  redeem: (rewardId: string) => void;
  isRedeeming: boolean;
}

export const useRewards = (): UseRewardsResult => {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const rewardsQuery = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Reward[] }>("/rewards");
      return data.data;
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { data } = await apiClient.post<Redemption>(`/rewards/${rewardId}/redeem`, {});
      return data;
    },
    onSuccess: async () => {
      toast({
        title: "Reward claimed",
        description: "Your reward redemption has been requested successfully.",
      });
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (error: any) => {
      let description = "Failed to redeem reward. Please try again.";

      const errorCode = error?.response?.data?.error?.code as string | undefined;
      const message = error?.response?.data?.error?.message as string | undefined;

      if (message) {
        description = message;
      } else if (errorCode === "INSUFFICIENT_POINTS") {
        description = "You don't have enough points to claim this reward.";
      } else if (errorCode === "REDEMPTION_LIMIT") {
        description = "You have already redeemed the maximum allowed times.";
      }

      toast({
        title: "Unable to claim reward",
        description,
        variant: "destructive",
      });
    },
  });

  return {
    rewards: rewardsQuery.data ?? [],
    loading: rewardsQuery.isLoading,
    error: rewardsQuery.error,
    redeem: (rewardId: string) => redeemMutation.mutate(rewardId),
    isRedeeming: redeemMutation.isPending,
  };
};


