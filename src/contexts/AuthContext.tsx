import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import apiClient, { setAuthToken } from "@/lib/apiClient";

// In AuthContext.tsx, update the AuthUser interface:
interface AuthUser {
  id: string;
  username?: string | null;
  email?: string | null;
  region?: Record<string, unknown> | null;
  civicPoints: number;
  civicLevel?: number;
  badges?: string[];
  avatarUrl?: string | null;
  bio?: string | null;
  role?: "user" | "field_admin" |"super_admin"; // UPDATED
  adminRegion?: string | null;
  permissions?: string[];
  level_info?: {
    level: number;
    name: string;
    color: string;
    progress: number;
    next_level_at: number | null;
  };
}
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isBootstrapping: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  signup: (payload: {
    email: string;
    password: string;
    username?: string;
    phone?: string;
    region?: Record<string, unknown> | string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeAdminRole = (role?: string | null): AuthUser["role"] => {
  if (!role) return "user";
  const normalized = role.toLowerCase();

  // Treat generic "admin" as super admin to ensure they get full access
  if (["super_admin", "superadmin", "super-admin", "admin"].includes(normalized)) {
    return "super_admin";
  }

  if (["field_admin", "fieldadmin", "normal_admin", "normal-admin"].includes(normalized)) {
    return "field_admin";
  }

  return "user";
};

const ACCESS_TOKEN_KEY = "cleanlink_token";
const REFRESH_TOKEN_KEY = "cleanlink_refresh_token";

const getStoredValue = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() =>
    getStoredValue(ACCESS_TOKEN_KEY)
  );
  const [refreshToken, setRefreshTokenState] = useState<string | null>(() =>
    getStoredValue(REFRESH_TOKEN_KEY)
  );
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(!!token);

  const persistSession = useCallback(
    (nextToken: string | null, nextRefreshToken: string | null) => {
      setTokenState(nextToken);
      setRefreshTokenState(nextRefreshToken);

      if (typeof window !== "undefined") {
        if (nextToken) {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
        } else {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }

      if (nextToken) {
        setAuthToken(nextToken);
      } else {
        setAuthToken(null);
      }

      if (typeof window !== "undefined") {
        if (nextRefreshToken) {
          window.localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
        } else {
          window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    },
    []
  );

  const handleAuthResponse = useCallback(
    (data: { user: AuthUser; token: string; refresh_token: string }) => {
      persistSession(data.token, data.refresh_token);
      const normalizedUser: AuthUser = {
        ...data.user,
        role: normalizeAdminRole(data.user.role),
      };
      setUser(normalizedUser);
    },
    [persistSession]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await apiClient.get<AuthUser>("/users/me");
      const normalizedUser: AuthUser = {
        ...data,
        role: normalizeAdminRole(data.role),
      };
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error: any) {
      // Only log non-401 errors (401 is expected when token is invalid/expired)
      if (error?.status !== 401) {
        console.error("Failed to fetch user profile", error);
      }
      // Clear token if it's invalid
      if (error?.status === 401) {
        persistSession(null, null);
      }
      return null;
    } finally {
      setIsBootstrapping(false);
    }
  }, [token, persistSession]);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      refreshProfile();
    } else {
      setAuthToken(null);
      setUser(null);
      setIsBootstrapping(false);
    }
  }, [token, refreshProfile]);

  const login = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { data } = await apiClient.post<{
        user: AuthUser;
        token: string;
        refresh_token: string;
      }>("/auth/login", { email, password });

      handleAuthResponse(data);
    },
    [handleAuthResponse]
  );

  const signup = useCallback(
    async ({
      email,
      password,
      username,
      phone,
      region,
      bio,
      avatar_url,
    }: {
      email: string;
      password: string;
      username?: string;
      phone?: string;
      region?: Record<string, unknown> | string;
      bio?: string;
      avatar_url?: string;
    }) => {
      const { data } = await apiClient.post<{
        user: AuthUser;
        token: string;
        refresh_token: string;
      }>("/auth/signup", {
        email,
        password,
        username,
        phone,
        region,
        bio,
        avatar_url,
      });

      handleAuthResponse(data);
    },
    [handleAuthResponse]
  );

  const logout = useCallback(() => {
    persistSession(null, null);
    setUser(null);
  }, [persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      login,
      signup,
      logout,
      refreshProfile,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, isBootstrapping, login, signup, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

