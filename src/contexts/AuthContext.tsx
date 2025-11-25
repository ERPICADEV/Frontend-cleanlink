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
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
      setUser(data.user);
    },
    [persistSession]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const { data } = await apiClient.get<AuthUser>("/users/me");
      setUser(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      return null;
    } finally {
      setIsBootstrapping(false);
    }
  }, [token]);

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
    }: {
      email: string;
      password: string;
      username?: string;
      phone?: string;
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

