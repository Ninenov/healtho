"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

import { NAVIGATION } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";

const ICONS = {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Bell,
  User,
  Users,
  Clock,
  Stethoscope,
  Building2,
  ShieldCheck,
  BarChart3,
};

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();

  if (!user) return null;

  const items = NAVIGATION[user.role as keyof typeof NAVIGATION] ?? [];

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-gray-200 bg-white",
          "transition-transform duration-200",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-sm font-bold text-white">
              H
            </div>

            <span className="text-lg font-semibold tracking-tight text-gray-950">
              HealthOS
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon =
                ICONS[item.icon as keyof typeof ICONS];

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-sm font-medium transition-colors",
                    active
                      ? "bg-gray-950 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.9}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Account */}
        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
              {user.first_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.first_name || "User"}
              </p>

              <p className="truncate text-xs text-gray-500">
                {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logoutUser()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}