import { ROLES, type Role } from "@/constants/roles";

export const ROLE_HOME: Record<Role, string> = {
  [ROLES.PATIENT]: "/dashboard/patient",
  [ROLES.DOCTOR]: "/dashboard/doctor",
  [ROLES.HOSPITAL]: "/dashboard/hospital",
  [ROLES.ADMIN]: "/dashboard/admin",
};