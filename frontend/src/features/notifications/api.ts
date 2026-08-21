import { apiClient } from "@/services/api/client";

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  target_type: string | null;
  target_id: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<Notification[]>(
    "/notifications/",
  );

  return response.data;
}

export async function markNotificationRead(
  notificationId: number,
) {
  const response = await apiClient.post<{
    id: number;
    status: string;
    read_at: string | null;
  }>(
    `/notifications/${notificationId}/read/`,
  );

  return response.data;
}