import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { ProfileUpdateData, RegionUpdateData, User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UseUserProfileResult {
  updateProfile: (data: ProfileUpdateData) => Promise<User | null>;
  updateRegion: (data: RegionUpdateData) => Promise<User | null>;
  isUpdating: boolean;
  isUpdatingRegion: boolean;
  error: unknown;
  clearError: () => void;
  lastSuccess: boolean;
}

export const useUserProfile = (): UseUserProfileResult => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const profileMutation = useMutation({
    mutationFn: async (payload: ProfileUpdateData) => {
      const { data } = await apiClient.patch<User>("/users/me", payload);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      refreshProfile();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        "Failed to update profile. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const regionMutation = useMutation({
    mutationFn: async (payload: RegionUpdateData) => {
      const { data } = await apiClient.patch<User>("/users/me/region", payload);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Region updated",
        description: "Your region has been updated successfully.",
      });
      refreshProfile();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        "Failed to update region. Please try again.";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) return null;
    return profileMutation.mutateAsync(data);
  };

  const updateRegion = async (data: RegionUpdateData) => {
    if (!user) return null;
    return regionMutation.mutateAsync(data);
  };

  return {
    updateProfile,
    updateRegion,
    isUpdating: profileMutation.isPending,
    isUpdatingRegion: regionMutation.isPending,
    error: profileMutation.error || regionMutation.error,
    clearError: () => {
      profileMutation.reset();
      regionMutation.reset();
    },
    lastSuccess: profileMutation.isSuccess || regionMutation.isSuccess,
  };
};


