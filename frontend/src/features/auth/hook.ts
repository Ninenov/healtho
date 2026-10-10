"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { LoginCredentials } from "@/types/auth";

import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
  type RegisterRequest,
} from "./api";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      register(data),

    onSuccess: (user) => {
      queryClient.setQueryData(
        ["auth", "me"],
        user,
      );
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      credentials: LoginCredentials,
    ) => login(credentials),

    onSuccess: (response) => {
      if (response.user) {
        queryClient.setQueryData(
          ["auth", "me"],
          response.user,
        );
      }
    },
  });
}

export function useCurrentUser(
  enabled = true,
) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refresh: string) =>
      refreshAccessToken(refresh),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: (refresh: string) =>
      logout(refresh),
  });
}