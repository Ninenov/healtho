"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
} from "./api";

import type { LoginCredentials } from "@/types/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refresh: string) => refreshAccessToken(refresh),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: (refresh: string) => logout(refresh),
  });
}