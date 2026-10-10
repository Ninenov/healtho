"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNotifications,
  markNotificationRead,
  type Notification,
} from "./api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      markNotificationRead(notificationId),

    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<Notification[]>(
        notificationKeys.list(),
        (current) => {
          if (!current) {
            return current;
          }

          return current.map((notification) =>
            notification.id === updatedNotification.id
              ? {
                  ...notification,
                  status: updatedNotification.status,
                  read_at: updatedNotification.read_at,
                }
              : notification,
          );
        },
      );
    },
  });
}