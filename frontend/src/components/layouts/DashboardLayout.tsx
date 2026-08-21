"use client";

import { useState } from "react";

import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}