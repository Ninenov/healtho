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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile */}
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      {/* Desktop title */}
      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-slate-950">
          HealthOS
        </p>

        <p className="text-xs text-slate-500">
          Healthcare workspace
        </p>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.9} />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 sm:block" />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold leading-5 text-slate-900">
            {name}
          </p>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {user?.role}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
          {initials}
        </div>
      </div>
    </header>
  );
}