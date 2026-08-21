import { apiClient } from "@/services/api/client";
import type {
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  User,
} from "@/types/auth";

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login/",
    credentials,
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me/");

  return response.data;
}

export async function refreshAccessToken(
  refresh: string,
): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>(
    "/auth/refresh/",
    { refresh },
  );

  return response.data;
}

export async function logout(refresh: string): Promise<void> {
  await apiClient.post("/auth/logout/", {
    refresh,
  });
}