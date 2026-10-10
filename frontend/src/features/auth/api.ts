import { apiClient } from "@/services/api/client";

import type {
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  User,
} from "@/types/auth";

export type RegistrationRole = "PATIENT" | "DOCTOR";

export interface RegisterRequest {
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: RegistrationRole;

  specialization?: string;
  qualification?: string;
  license_number?: string;
}

export interface RegisterResponse extends User {
  verification_status?: "PENDING" | "VERIFIED" | "REJECTED";
}

export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  const response =
    await apiClient.post<RegisterResponse>(
      "/auth/register/",
      data,
    );

  return response.data;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response =
    await apiClient.post<LoginResponse>(
      "/auth/login/",
      credentials,
    );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response =
    await apiClient.get<User>("/auth/me/");

  return response.data;
}

export async function refreshAccessToken(
  refresh: string,
): Promise<RefreshResponse> {
  const response =
    await apiClient.post<RefreshResponse>(
      "/auth/refresh/",
      { refresh },
    );

  return response.data;
}

export async function logout(
  refresh: string,
): Promise<void> {
  await apiClient.post("/auth/logout/", {
    refresh,
  });
}