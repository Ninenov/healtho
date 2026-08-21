"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  login,
  logout,
} from "@/features/auth/api";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/services/api/client";

import type {
  LoginCredentials,
  User,
} from "@/types/auth";

import { AUTH_EXPIRED_EVENT } from "@/utils/auth-events";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginUser: (
    credentials: LoginCredentials,
  ) => Promise<User>;
  logoutUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const loginUser = useCallback(
    async (
      credentials: LoginCredentials,
    ) => {
      const response =
        await login(credentials);

      setTokens(
        response.access,
        response.refresh,
      );

      setUser(response.user);

      return response.user;
    },
    [],
  );

  const logoutUser = useCallback(
    async () => {
      const refreshToken =
        getRefreshToken();

      try {
        if (refreshToken) {
          await logout(refreshToken);
        }
      } finally {
        clearTokens();
        setUser(null);
        router.replace("/login");
      }
    },
    [router],
  );

  /*
   * Restore an existing session.
   */
  useEffect(() => {
    async function restoreSession() {
      if (!getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  /*
   * Handle global JWT expiration.
   *
   * Axios emits this event when:
   *
   * access token expired
   *        ↓
   * refresh attempted
   *        ↓
   * refresh failed
   */
  useEffect(() => {
    const handleAuthExpired = () => {
      clearTokens();
      setUser(null);
      router.replace("/login");
    };

    window.addEventListener(
      AUTH_EXPIRED_EVENT,
      handleAuthExpired,
    );

    return () => {
      window.removeEventListener(
        AUTH_EXPIRED_EVENT,
        handleAuthExpired,
      );
    };
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      loginUser,
      logoutUser,
    }),
    [
      user,
      isLoading,
      loginUser,
      logoutUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider",
    );
  }

  return context;
}