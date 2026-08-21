"use client";

import { RoleRoute } from "@/components/navigation/RoleRoute";
import { ROLES } from "@/constants/roles";

export default function AdminDashboard() {
  return (
    <RoleRoute allowedRoles={[ROLES.ADMIN]}>
      <main className="p-6">
        <h1 className="text-2xl font-semibold">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome to HealthOS.
        </p>
      </main>
    </RoleRoute>
  );
}