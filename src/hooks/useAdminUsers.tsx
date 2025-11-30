import { useState, useEffect } from "react";
import { fetchAdminUsers } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminUsers = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAdminUsers()
      .then(setAdmins)
      .catch((err) => setError(err?.message || "Failed to fetch admins"))
      .finally(() => setLoading(false));
  }, [token]);

  return { admins, loading, error };
};