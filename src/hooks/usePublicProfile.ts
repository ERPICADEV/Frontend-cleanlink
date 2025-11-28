import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { User } from "@/types/user";

export const usePublicProfile = (userId?: string) => {
  return useQuery<User>({
    queryKey: ["public-profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(`/users/${userId}/public`);
      return data;
    },
    retry: 1,
  });
};


