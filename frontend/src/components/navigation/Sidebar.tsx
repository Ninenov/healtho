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

  const items =
    NAVIGATION[user.role as keyof typeof NAVIGATION] ?? [];

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "border-r border-slate-200 bg-white",
          "transition-transform duration-200",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              H
            </div>

            <span className="text-lg font-bold tracking-tight text-slate-950">
              HealthOS
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {items.map((item) => {
              const Icon =
                ICONS[item.icon as keyof typeof ICONS];

              if (!Icon) return null;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-3",
                    "text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
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
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {user.first_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.first_name || "User"}
              </p>

              <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logoutUser()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}