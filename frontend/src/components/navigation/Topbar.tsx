"use client";

import { Bell, Menu } from "lucide-react";

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

  const initials =
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .map((value) => value?.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      {/* Desktop title */}
      <div className="hidden lg:block">
        <p className="text-sm font-medium text-gray-900">
          HealthOS
        </p>
        <p className="text-xs text-gray-500">
          Healthcare workspace
        </p>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.9} />

          {/* Keep hidden until unread count is connected */}
          <span className="absolute right-1.5 top-1.5 hidden h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-7 w-px bg-gray-200 sm:block" />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-5 text-gray-900">
            {name}
          </p>

          <p className="text-xs uppercase tracking-wide text-gray-500">
            {user?.role}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}