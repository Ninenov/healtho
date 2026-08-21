"use client";

import { Menu, Bell } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const { user } = useAuth();

  const name =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") || "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-gray-500">
          HealthOS
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg p-2 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-gray-500">
            {user?.role}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}