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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white",
          "transition-transform duration-200",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center border-b px-5">
          <Link
            href="/"
            className="text-xl font-bold"
            onClick={onClose}
          >
            HealthOS
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                ].join(" ")}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <button
            type="button"
            onClick={() => void logoutUser()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}