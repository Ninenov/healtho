"use client";

import { Bell } from "lucide-react";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ROLES } from "@/constants/roles";

import {
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";

export default function DoctorNotificationsPage() {
  const query = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Doctor workspace
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-gray-950">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay up to date with appointment and system activity.
          </p>
        </div>

        {query.isLoading && (
          <LoadingState message="Loading notifications..." />
        )}

        {query.isError && (
          <ErrorState
            title="Unable to load notifications"
            description="We could not retrieve your notifications."
            onRetry={() => query.refetch()}
          />
        )}

        {query.isSuccess && query.data.length === 0 && (
          <EmptyState
            title="No notifications"
            description="You're all caught up."
          />
        )}

        {query.isSuccess && query.data.length > 0 && (
          <div className="space-y-3">
            {query.data.map((notification) => {
              const unread =
                notification.status !== "READ";

              return (
                <div
                  key={notification.id}
                  className={[
                    "rounded-xl border bg-white p-5 shadow-sm",
                    unread
                      ? "border-gray-900"
                      : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Bell size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="font-medium text-gray-950">
                            {notification.title}
                          </h2>

                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>

                        {unread && (
                          <span className="w-fit rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                            New
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-400">
                          {new Date(
                            notification.created_at,
                          ).toLocaleString("en-IN")}
                        </p>

                        {unread && (
                          <button
                            type="button"
                            disabled={markRead.isPending}
                            onClick={() =>
                              markRead.mutate(
                                notification.id,
                              )
                            }
                            className="w-fit text-sm font-medium underline disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleRoute>
  );
}