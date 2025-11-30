import { useState, useEffect } from "react";
import { fetchAdminStats } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAdminStats()
      .then(setStats)
      .catch((err) => setError(err?.message || "Failed to fetch stats"))
      .finally(() => setLoading(false));
  }, [token]);

  return { stats, loading, error };
};