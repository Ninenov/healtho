"use client";

import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/constants/roles";

export function useRole() {
  const { user } = useAuth();

  return {
    role: user?.role as Role | undefined,
    isPatient: user?.role === "PATIENT",
    isDoctor: user?.role === "DOCTOR",
    isHospital: user?.role === "HOSPITAL",
    isAdmin: user?.role === "ADMIN",
  };
}