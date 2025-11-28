import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { RegionsResponse } from "@/types/user";

export const useRegions = () => {
  return useQuery<RegionsResponse>({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data } = await apiClient.get<RegionsResponse>("/users/regions");
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

