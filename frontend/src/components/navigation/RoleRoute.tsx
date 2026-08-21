"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/constants/roles";
import { ROLE_HOME } from "@/constants/routes";

export function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (
      !isLoading &&
      user &&
      !allowedRoles.includes(user.role as Role)
    ) {
      router.replace(
        ROLE_HOME[user.role as Role] ?? "/login",
      );
    }
  }, [allowedRoles, isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!allowedRoles.includes(user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}