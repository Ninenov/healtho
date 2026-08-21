import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { emitAuthExpired } from "@/utils/auth-events";

const ACCESS_TOKEN_KEY = "healthos_access_token";
const REFRESH_TOKEN_KEY = "healthos_refresh_token";

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (
  access: string,
  refresh?: string,
) => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    ACCESS_TOKEN_KEY,
    access,
  );

  if (refresh) {
    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      refresh,
    );
  }
};

export const clearTokens = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ access: string }>(
        "/auth/refresh/",
        { refresh },
      )
      .then((response) => {
        setTokens(response.data.access);

        return response.data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes(
        "/auth/refresh/",
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken =
        await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      emitAuthExpired();

      return Promise.reject(refreshError);
    }
  },
);